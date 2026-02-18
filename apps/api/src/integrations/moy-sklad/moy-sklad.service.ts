import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type Meta = {
  href: string;
  type: string;
  mediaType: 'application/json';
  price?: number;
};

@Injectable()
export class MoySkladService {
  private readonly http: AxiosInstance;
  private readonly baseUrl = 'https://api.moysklad.ru/api/remap/1.2';
  private organizationIdPromise?: Promise<string>;
  private readonly assortmentCache = new Map<string, Meta>();

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

  private meta(href: string, type: string, price?: number): { meta: Meta } {
    return { meta: { href, type, price, mediaType: 'application/json' } };
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

  async resolveAssortmentMetaBySku(sku: string): Promise<Meta> {
    const key = sku.trim();
    const cached = this.assortmentCache.get(key);
    if (cached) return cached;

    const res = await this.http.get('/entity/assortment', {
      params: {
        filter: `code=${key};archived=false`,
        limit: 50,
      },
    });

    const rows: any[] = res.data?.rows ?? [];

    const exact = rows.filter((r) => String(r?.code ?? '').trim() === key);

    if (exact.length === 0) {
      throw new Error(`MoySklad: assortment not found by code=${key}`);
    }
    if (exact.length > 1) {
      const types = exact.map((r) => r?.meta?.type).filter(Boolean);
      const ids = exact.map((r) => r?.id).filter(Boolean);
      throw new Error(
        `MoySklad: multiple assortments with code=${key} (types=${types.join(',')}; ids=${ids.join(',')})`,
      );
    }

    const meta = exact[0]?.meta;
    const price = exact[0]?.salePrices[0].value;
    if (!meta?.href || !meta?.type) {
      throw new Error(`MoySklad: broken meta for code=${key}`);
    }

    const out: Meta = {
      href: meta.href,
      type: meta.type,
      mediaType: 'application/json',
      price,
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
    positions: Array<{ sku: string; qty?: number; priceMinor?: number }>;
  }) {
    const organizationId = await this.getOrganizationId();

    const msPositions = await this.mapLimit(input.positions, 6, async (p) => {
      const a = await this.resolveAssortmentMetaBySku(p.sku); // product/service — не важно
      return {
        quantity: p.qty || 1,
        price: a.price || p.priceMinor,
        assortment: { meta: a },
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
    };

    const created = await this.http.post('/entity/invoiceout', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const invoiceId = created.data?.id as string | undefined;
    if (!invoiceId) throw new Error('Moysklad: invoiceout create failed');

    // В МС обычно есть name/number — выбери то, что хочешь хранить.
    const invoiceName =
      (created.data?.name as string | undefined) ??
      (created.data?.number as string | undefined) ??
      null;

    // Обновляем ордера
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

  async downloadInvoicePdf(invoiceoutId: string): Promise<Buffer> {
    const res = await this.http.get(
      `/entity/invoiceout/${invoiceoutId}/export`,
      {
        responseType: 'arraybuffer',
        headers: { Accept: 'application/pdf' },
      },
    );
    return Buffer.from(res.data);
  }
}
