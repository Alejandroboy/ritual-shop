import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

  constructor(private readonly prismaService: PrismaService) {
    const token = process.env.MOYSKLAD_TOKEN;
    if (!token) throw new Error('MOYSKLAD_TOKEN is not set');

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;charset=utf-8',
      },
      timeout: 20_000,
    });
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
}
