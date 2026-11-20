import axios, { AxiosInstance } from 'axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigurationService } from '../../config/configuration.service';
import { Prisma } from '@prisma/client';
import {
  getNextInvoiceCheckAt,
  resolveInvoiceStatus,
} from '../../common/helpers';

type MsMeta = {
  href: string;
  type: string;
  mediaType: 'application/json';
};

type AssortmentResolved = {
  meta: MsMeta;
  price?: number;
  name?: string;
};

@Injectable()
export class MoySkladService {
  private readonly http: AxiosInstance;
  private readonly baseUrl = 'https://api.moysklad.ru/api/remap/1.2';
  private organizationIdPromise?: Promise<string>;
  private readonly assortmentCache = new Map<string, AssortmentResolved>();

  constructor(
    private readonly prismaService: PrismaService,
    config: ConfigurationService,
  ) {
    const token = config.get('MOYSKLAD_TOKEN');

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;charset=utf-8',
      },
      timeout: 20_000,
    });
  }

  private getDrillingSkuByMaterial(
    material:
      | 'CERMET'
      | 'WHITE_CERAMIC_GRANITE'
      | 'BLACK_CERAMIC_GRANITE'
      | 'GLASS'
      | 'GROWTH_PHOTOCERAMICS'
      | 'ENGRAVING'
      | null
      | undefined,
  ): string | null {
    if (
      material === 'WHITE_CERAMIC_GRANITE' ||
      material === 'BLACK_CERAMIC_GRANITE' ||
      material === 'GROWTH_PHOTOCERAMICS'
    ) {
      return '20169';
    }

    if (material === 'GLASS') {
      return '20185';
    }

    if (material === 'ENGRAVING') {
      return '20186';
    }

    return null;
  }

  private toSafeErrorDetails(e: unknown):
    | {
        message?: unknown;
        errors?: unknown;
        statusCode?: unknown;
      }
    | undefined {
    const resp =
      (e as any)?.getResponse?.() ?? (e as any)?.response ?? undefined;

    if (!resp) return undefined;

    if (typeof resp === 'string') return { message: resp };

    if (typeof resp === 'object') {
      const r: any = resp;
      return {
        message: r.message,
        errors: r.errors,
        statusCode: r.statusCode,
      };
    }

    return { message: resp };
  }

  async getOrganizationId(): Promise<string> {
    if (!this.organizationIdPromise) {
      this.organizationIdPromise = (async () => {
        const res = await this.http.get('/entity/organization');
        const org = res.data?.rows?.[0];
        if (!org?.id) throw new Error('Moysklad: organization not found');
        return org.id;
      })();
    }
    return this.organizationIdPromise;
  }

  private meta(href: string, type: string): { meta: MsMeta } {
    return { meta: { href, type, mediaType: 'application/json' } };
  }

  async findCounterpartyIdByInn(inn: string): Promise<string | null> {
    const res = await this.http.get('/entity/counterparty', {
      params: {
        filter: `inn=${inn}`,
        limit: 1000,
      },
    });

    const rows: any[] = res.data?.rows ?? [];
    const hit = rows.find((c) => c?.inn === inn);
    return hit?.id ?? null;
  }

  async findOrCreateCounterpartyLegal(input: {
    name: string;
    inn: string;
    legalAddress?: string;
  }): Promise<string> {
    const payload: any = {
      name: input.name,
      legalTitle: input.name,
      companyType: 'legal',
      inn: input.inn,
    };

    const existingId = await this.findCounterpartyIdByInn(input.inn);
    if (existingId) return existingId;
    if (input.legalAddress) payload.legalAddress = input.legalAddress;

    const res = await this.http.post('/entity/counterparty', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.data?.id) throw new Error('Moysklad: counterparty create failed');

    return res.data.id as string;
  }

  async resolveAssortmentMetaBySku(sku: string): Promise<AssortmentResolved> {
    const key = sku.trim();
    const cached = this.assortmentCache.get(key);
    if (cached) return cached;

    const res = await this.http.get('/entity/assortment', {
      params: { filter: `code=${key};archived=false`, limit: 50 },
    });

    const rows: any[] = res.data?.rows ?? [];
    const exact = rows.filter((r) => String(r?.code ?? '').trim() === key);

    if (exact.length === 0)
      throw new Error(`MoySklad: assortment not found by code=${key}`);
    if (exact.length > 1)
      throw new Error(`MoySklad: multiple assortments with code=${key}`);

    const row = exact[0];
    const meta = row?.meta;
    const price = row?.salePrices?.[0]?.value;
    const name = row?.name;

    if (!meta?.href || !meta?.type)
      throw new Error(`MoySklad: broken meta for code=${key}`);

    const out: AssortmentResolved = {
      meta: { href: meta.href, type: meta.type, mediaType: 'application/json' },
      price,
      name,
    };

    this.assortmentCache.set(key, out);
    return out;
  }

  private async mapLimit<T, R>(
    items: T[],
    limit: number,
    fn: (t: T) => Promise<R>,
  ): Promise<R[]> {
    const ret: R[] = new Array(items.length);
    let i = 0;
    const workers = new Array(Math.min(limit, items.length))
      .fill(0)
      .map(async () => {
        while (i < items.length) {
          const idx = i++;
          ret[idx] = await fn(items[idx]);
        }
      });
    await Promise.all(workers);
    return ret;
  }

  async createInvoiceOut(input: {
    counterpartyId: string;
    orderIds: string[];
    positions: Array<{
      sku: string;
      qty?: number;
      priceMinor?: number;
      description?: string;
      label?: string;
    }>;
    invoiceDescription?: string;
  }) {
    const organizationId = await this.getOrganizationId();

    const msPositions = await this.mapLimit(input.positions, 6, async (p) => {
      const a = await this.resolveAssortmentMetaBySku(p.sku);

      const price =
        (typeof p.priceMinor === 'number' ? p.priceMinor : undefined) ??
        (typeof a.price === 'number' ? a.price : undefined);

      return {
        quantity: p.qty ?? 1,
        ...(typeof price === 'number' ? { price } : {}),
        assortment: { meta: a.meta },
        ...(p.description ? { description: p.description } : {}),
      };
    });

    const payload = {
      organization: this.meta(
        `${this.baseUrl}/entity/organization/${organizationId}`,
        'organization',
      ),
      agent: this.meta(
        `${this.baseUrl}/entity/counterparty/${input.counterpartyId}`,
        'counterparty',
      ),
      positions: msPositions,
      ...(input.invoiceDescription
        ? { description: input.invoiceDescription }
        : {}),
    };

    const created = await this.http.post('/entity/invoiceout', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const invoiceId = created.data?.id as string | undefined;
    if (!invoiceId) throw new Error('Moysklad: invoiceout create failed');

    const invoiceName =
      (created.data?.name as string | undefined) ??
      (created.data?.number as string | undefined) ??
      null;

    const totalMinor =
      typeof created.data?.sum === 'number' ? created.data.sum : 0;

    const paidMinor =
      typeof created.data?.payedSum === 'number' ? created.data.payedSum : 0;

    const status = resolveInvoiceStatus({
      sum: totalMinor,
      payedSum: paidMinor,
    });

    const now = new Date();

    await this.prismaService.invoice.upsert({
      where: { id: invoiceId },
      create: {
        id: invoiceId,
        name: invoiceName,
        description: input.invoiceDescription ?? null,
        status,
        totalMinor,
        paidMinor,
        createdAtRemote: created.data?.created
          ? new Date(created.data.created)
          : null,
        updatedAtRemote: created.data?.updated
          ? new Date(created.data.updated)
          : null,
        lastCheckedAt: now,
        nextCheckAt: getNextInvoiceCheckAt({
          status,
          createdAt: now,
        }),
        paidAt: status === 'PAID' ? now : null,
      },
      update: {
        name: invoiceName,
        description: input.invoiceDescription ?? null,
        status,
        totalMinor,
        paidMinor,
        updatedAtRemote: created.data?.updated
          ? new Date(created.data.updated)
          : null,
        lastCheckedAt: now,
        nextCheckAt: getNextInvoiceCheckAt({
          status,
          createdAt: now,
        }),
        paidAt: status === 'PAID' ? now : null,
      },
    });

    if (input.orderIds?.length) {
      await this.prismaService.order.updateMany({
        where: { id: { in: input.orderIds } },
        data: {
          includedInInvoice: true,
          invoiceId,
          invoiceName,
        },
      });
    }

    return created.data;
  }

  async getInvoiceOutById(invoiceId: string) {
    const res = await this.http.get(`/entity/invoiceout/${invoiceId}`, {
      headers: { Accept: 'application/json;charset=utf-8' },
    });

    if (!res.data?.id) {
      throw new Error(`Moysklad: invoiceout ${invoiceId} not found`);
    }
    return res.data;
  }

  async getOrCreateOrderInvoicePublicationHtmlUrl(
    orderId: string,
    templateId: string,
  ): Promise<string> {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        invoiceId: true,
        invoicePublicationHtmlUrl: true,
      },
    });

    if (!order) throw new Error('Order not found');
    if (order.invoicePublicationHtmlUrl) return order.invoicePublicationHtmlUrl;

    if (!order.invoiceId)
      throw new Error('Order has no invoiceId (moysklad invoiceoutId)');

    if (!templateId) throw new Error('Order has no templateId');

    const pubRes = await this.http.post(
      `/entity/invoiceout/${order.invoiceId}/publication`,
      {
        template: {
          meta: {
            href: `${this.baseUrl}/entity/invoiceout/metadata/embeddedtemplate/${templateId}`,
            type: 'embeddedtemplate',
            mediaType: 'application/json',
          },
        },
        extension: 'pdf',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json;charset=utf-8',
        },
      },
    );

    const shortUrl = pubRes.data?.href as string | undefined;
    if (!shortUrl)
      throw new Error('MoySklad: publication response has no href');

    const r = await axios.get(shortUrl, {
      maxRedirects: 10,
      timeout: 20_000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,*/*',
      },
      validateStatus: () => true,
    });

    const finalUrl =
      (r.request?.res?.responseUrl as string | undefined) ?? shortUrl;

    const htmlUrl = finalUrl.endsWith('.html') ? finalUrl : `${finalUrl}.html`;

    await this.prismaService.order.update({
      where: { id: orderId },
      data: { invoicePublicationHtmlUrl: htmlUrl },
    });

    return htmlUrl;
  }

  async syncTemplatePricesFromMoysklad(input: {
    templateId: number;
    concurrency?: number;
  }): Promise<{
    templateId: number;
    requiresFinish: boolean;
    updated: number;
    perHoleUpdated: boolean;
  }> {
    const concurrency = input.concurrency ?? 6;

    const tpl = await this.prismaService.template.findUnique({
      where: { id: input.templateId },
      select: {
        id: true,
        requiresFinish: true,
        material: true,
        perHolePrice: true,
        allowedSizes: {
          select: {
            templateId: true,
            sizeId: true,
            price: true,
            skuCode: true,
          },
        },
        finishPrices: {
          select: {
            templateId: true,
            sizeId: true,
            finish: true,
            price: true,
            skuCode: true,
          },
        },
      },
    });

    if (!tpl) throw new NotFoundException('Template not found');

    const drillingSku = this.getDrillingSkuByMaterial(tpl.material);

    const shouldSyncPerHole = Boolean(drillingSku);

    const shouldUseFinishPrices =
      tpl.requiresFinish && (tpl.finishPrices?.length ?? 0) > 0;

    const errors: string[] = [];

    let perHoleResolved: number | null = null;
    if (shouldSyncPerHole && drillingSku) {
      try {
        const a = await this.resolveAssortmentMetaBySku(drillingSku);
        if (typeof a.price !== 'number' || !Number.isFinite(a.price)) {
          errors.push(
            `drilling sku=${drillingSku}: no sale price (salePrices.value missing)`,
          );
        } else {
          perHoleResolved = Number(a.price);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`drilling sku=${drillingSku}: ${msg}`);
      }
    }

    if (!shouldUseFinishPrices) {
      const candidates = tpl.allowedSizes;

      const resolved = await this.mapLimit(
        candidates,
        concurrency,
        async (r) => {
          const sku = String(r.skuCode ?? '').trim();
          if (!sku) {
            errors.push(`allowedSizes: sizeId=${r.sizeId}: skuCode is empty`);
            return null;
          }

          const a = await this.resolveAssortmentMetaBySku(sku);

          if (typeof a.price !== 'number' || !Number.isFinite(a.price)) {
            errors.push(
              `allowedSizes: sku=${sku} (sizeId=${r.sizeId}): no sale price`,
            );
            return null;
          }

          return { sizeId: r.sizeId, price: Number(a.price), sku };
        },
      );

      if (errors.length) {
        throw new BadRequestException({
          message: 'MoySklad sync failed',
          templateId: tpl.id,
          requiresFinish: tpl.requiresFinish,
          storage: 'allowedSizes',
          errors,
        });
      }

      const updates = resolved.filter(
        (x): x is { sizeId: number; price: number; sku: string } => x !== null,
      );

      const tx: Prisma.PrismaPromise<unknown>[] = updates.map((u) =>
        this.prismaService.templateSize.update({
          where: {
            templateId_sizeId: {
              templateId: tpl.id,
              sizeId: u.sizeId,
            },
          },
          data: { price: u.price },
        }),
      );

      let perHoleUpdated = false;
      if (shouldSyncPerHole && perHoleResolved !== null) {
        tx.push(
          this.prismaService.template.update({
            where: { id: tpl.id },
            data: { perHolePrice: perHoleResolved }, // копейки
          }),
        );
        perHoleUpdated = true;
      }

      await this.prismaService.$transaction(tx);

      return {
        templateId: tpl.id,
        requiresFinish: tpl.requiresFinish,
        updated: updates.length,
        perHoleUpdated,
      };
    }

    {
      const candidates = tpl.finishPrices;

      const resolved = await this.mapLimit(
        candidates,
        concurrency,
        async (r) => {
          const sku = String(r.skuCode ?? '').trim();
          if (!sku) {
            errors.push(
              `finishPrices: sizeId=${r.sizeId}, finish=${String(r.finish)}: skuCode is empty`,
            );
            return null;
          }

          const a = await this.resolveAssortmentMetaBySku(sku);

          if (typeof a.price !== 'number' || !Number.isFinite(a.price)) {
            errors.push(
              `finishPrices: sku=${sku} (sizeId=${r.sizeId}, finish=${String(r.finish)}): no sale price`,
            );
            return null;
          }

          return {
            sizeId: r.sizeId,
            finish: r.finish,
            price: Number(a.price),
            sku,
          };
        },
      );

      if (errors.length) {
        throw new BadRequestException({
          message: 'MoySklad sync failed',
          templateId: tpl.id,
          requiresFinish: true,
          storage: 'finishPrices',
          errors,
        });
      }

      const updates = resolved.filter(
        (
          x,
        ): x is {
          sizeId: number;
          finish: (typeof tpl.finishPrices)[number]['finish'];
          price: number;
          sku: string;
        } => x !== null,
      );

      const tx: Prisma.PrismaPromise<unknown>[] = updates.map((u) =>
        this.prismaService.templateSizeFinishPrice.update({
          where: {
            templateId_sizeId_finish: {
              templateId: tpl.id,
              sizeId: u.sizeId,
              finish: u.finish,
            },
          },
          data: { price: u.price },
        }),
      );

      let perHoleUpdated = false;
      if (shouldSyncPerHole && perHoleResolved !== null) {
        tx.push(
          this.prismaService.template.update({
            where: { id: tpl.id },
            data: { perHolePrice: perHoleResolved },
          }),
        );
        perHoleUpdated = true;
      }

      await this.prismaService.$transaction(tx);

      return {
        templateId: tpl.id,
        requiresFinish: true,
        updated: updates.length,
        perHoleUpdated,
      };
    }
  }

  async syncAllTemplatesPricesFromMoysklad(input?: {
    templateConcurrency?: number;
    stopOnError?: boolean;
  }): Promise<{
    total: number;
    ok: number;
    failed: number;
    results: Array<{
      templateId: number;
      ok: boolean;
      updated?: number;
      perHoleUpdated?: boolean;
      error?: string;
      errorDetails?: {
        message?: unknown;
        errors?: unknown;
        statusCode?: unknown;
      };
    }>;
  }> {
    const templateConcurrency = input?.templateConcurrency ?? 6;
    const stopOnError = input?.stopOnError ?? false;

    const templates = await this.prismaService.template.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    const results: Array<{
      templateId: number;
      ok: boolean;
      updated?: number;
      perHoleUpdated?: boolean;
      error?: string;
      errorDetails?: {
        message?: unknown;
        errors?: unknown;
        statusCode?: unknown;
      };
    }> = [];

    let ok = 0;
    let failed = 0;

    for (const t of templates) {
      try {
        const r = await this.syncTemplatePricesFromMoysklad({
          templateId: t.id,
          concurrency: templateConcurrency,
        });

        results.push({
          templateId: t.id,
          ok: true,
          updated: r.updated,
          perHoleUpdated: r.perHoleUpdated,
        });
        ok += 1;
      } catch (e: unknown) {
        failed += 1;

        const err =
          e instanceof Error
            ? e.message
            : typeof e === 'string'
              ? e
              : 'Unknown error';

        const errorDetails = this.toSafeErrorDetails(e);

        results.push({
          templateId: t.id,
          ok: false,
          error: err,
          errorDetails,
        });

        if (stopOnError) break;
      }
    }

    return {
      total: templates.length,
      ok,
      failed,
      results,
    };
  }

  async syncInvoiceById(invoiceId: string) {
    const remote = await this.getInvoiceOutById(invoiceId);

    const totalMinor = typeof remote.sum === 'number' ? remote.sum : 0;
    const paidMinor = typeof remote.payedSum === 'number' ? remote.payedSum : 0;

    const status = resolveInvoiceStatus({
      sum: totalMinor,
      payedSum: paidMinor,
    });

    const existing = await this.prismaService.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, createdAt: true },
    });

    const baseCreatedAt = existing?.createdAt ?? new Date();
    const now = new Date();

    const invoice = await this.prismaService.invoice.upsert({
      where: { id: invoiceId },
      create: {
        id: remote.id,
        name: remote.name ?? null,
        description: remote.description ?? null,
        status,
        totalMinor,
        paidMinor,
        createdAtRemote: remote.created ? new Date(remote.created) : null,
        updatedAtRemote: remote.updated ? new Date(remote.updated) : null,
        lastCheckedAt: now,
        nextCheckAt: getNextInvoiceCheckAt({
          status,
          createdAt: baseCreatedAt,
        }),
        paidAt: status === 'PAID' ? now : null,
      },
      update: {
        name: remote.name ?? null,
        description: remote.description ?? null,
        status,
        totalMinor,
        paidMinor,
        createdAtRemote: remote.created ? new Date(remote.created) : undefined,
        updatedAtRemote: remote.updated ? new Date(remote.updated) : undefined,
        lastCheckedAt: now,
        nextCheckAt: getNextInvoiceCheckAt({
          status,
          createdAt: baseCreatedAt,
        }),
        paidAt: status === 'PAID' ? now : null,
      },
    });

    await this.prismaService.order.updateMany({
      where: { invoiceId: invoice.id },
      data: {
        invoiceName: invoice.name ?? undefined,
      },
    });

    return invoice;
  }

  async syncPendingInvoices(limit = 50) {
    const now = new Date();

    const pending = await this.prismaService.invoice.findMany({
      where: {
        status: { in: ['UNPAID', 'PARTIAL'] },
        OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }],
      },
      orderBy: [{ nextCheckAt: 'asc' }, { createdAt: 'asc' }],
      take: limit,
      select: {
        id: true,
      },
    });

    const results = await this.mapLimit(pending, 5, async (item) => {
      try {
        const invoice = await this.syncInvoiceById(item.id);
        return {
          invoiceId: item.id,
          ok: true as const,
          status: invoice.status,
        };
      } catch (error) {
        await this.prismaService.invoice.update({
          where: { id: item.id },
          data: {
            lastCheckedAt: new Date(),
            nextCheckAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });

        return {
          invoiceId: item.id,
          ok: false as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    return {
      total: pending.length,
      results,
    };
  }
}
