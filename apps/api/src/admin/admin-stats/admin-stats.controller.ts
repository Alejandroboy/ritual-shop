import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Prisma, OrderStatus, Finish } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminGuard } from '../../common/admin.guard';

type Grain = 'day' | 'week' | 'month';

function step(d: Date, g: Grain): void {
  // двигаем курсор к следующему ведру
  if (g === 'day') {
    d.setDate(d.getDate() + 1);
    return;
  }
  if (g === 'week') {
    d.setDate(d.getDate() + 7);
    return;
  }
  /* g === 'month' */ d.setMonth(d.getMonth() + 1);
}
@UseGuards(AdminGuard)
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async get(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('grain') grain: 'day' | 'week' | 'month' = 'day',
  ) {
    console.log('123');
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 30 * 24 * 3600 * 1000);

    // 1) Очередь по статусам
    const byStatus = await this.prisma.order.groupBy({
      by: ['orderStatus'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { _all: true },
    });
    const ordersByStatus: Record<OrderStatus, number> = {
      DRAFT: 0,
      ACCEPTED: 0,
      IN_PROGRESS: 0,
      APPROVAL: 0,
      SENT: 0,
      READY: 0,
    };
    for (const r of byStatus) ordersByStatus[r.orderStatus] = r._count._all;

    // 2) Серия новых заказов (дневная агрегация в JS — удобно и кросс-БД)
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const series = bucketTimeSeries(
      orders.map((o) => o.createdAt),
      fromDate,
      toDate,
      grain,
    );

    // 3) ТОП шаблонов по позициям
    const itemsByTemplate = await this.prisma.orderItem.groupBy({
      by: ['templateId'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { _all: true },
    });
    itemsByTemplate.sort((a, b) => b._count._all - a._count._all);
    const topT = itemsByTemplate.slice(0, 10);
    const tplIds = topT.map((t) => t.templateId);
    const tplMap = (
      await this.prisma.template.findMany({
        where: { id: { in: tplIds } },
        select: { id: true, code: true, label: true },
      })
    ).reduce<Record<string, { code: string; label: string }>>(
      (m, t) => ((m[t.id] = { code: t.code, label: t.label }), m),
      {},
    );
    const topTemplates = topT.map((t) => ({
      templateId: t.templateId,
      count: t._count._all,
      code: tplMap[t.templateId]?.code,
      label: tplMap[t.templateId]?.label,
    }));

    // 4) Распределение по размерам
    const bySize = await this.prisma.orderItem.groupBy({
      by: ['sizeId'],
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        sizeId: { not: null },
      },
      _count: { _all: true },
    });
    bySize.sort((a, b) => b._count._all - a._count._all);
    const sizeIds = bySize.slice(0, 10).map((s) => s.sizeId!);
    const sizeMap = (
      await this.prisma.size.findMany({
        where: { id: { in: sizeIds } },
        select: { id: true, label: true, widthCm: true, heightCm: true },
      })
    ).reduce<Record<number, any>>((m, s) => ((m[s.id] = s), m), {});
    const sizeDistribution = bySize.slice(0, 10).map((s) => ({
      sizeId: s.sizeId,
      count: s._count._all,
      label: sizeMap[s.sizeId!]?.label,
    }));

    // 5) Использование финишей
    const finishUsageRaw = await this.prisma.orderItem.groupBy({
      by: ['finish'],
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        finish: { not: null },
      },
      _count: { _all: true },
    });
    const finishUsage = Object.values(Finish).map((f) => ({
      finish: f,
      count: finishUsageRaw.find((x) => x.finish === f)?._count._all ?? 0,
    }));

    // 6) Доля позиций с фото / primary
    const [withPhoto, withPrimary, totalItems] = await Promise.all([
      this.prisma.orderItem.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate },
          assets: { some: { kind: 'PHOTO' } },
        },
      }),
      this.prisma.orderItem.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate },
          assets: { some: { kind: 'PHOTO', primary: true } },
        },
      }),
      this.prisma.orderItem.count({
        where: { createdAt: { gte: fromDate, lte: toDate } },
      }),
    ]);
    const attachments = {
      withPhoto,
      withPrimary,
      totalItems,
      withPhotoPct: totalItems
        ? +((withPhoto / totalItems) * 100).toFixed(1)
        : 0,
      withPrimaryPct: totalItems
        ? +((withPrimary / totalItems) * 100).toFixed(1)
        : 0,
    };

    // 7) Средняя длительность заказа до READY (в днях)
    const ready = await this.prisma.order.findMany({
      where: {
        orderStatus: 'READY',
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { createdAt: true, updatedAt: true },
    });
    const avgLeadTimeReadyDays = ready.length
      ? +(
          ready.reduce(
            (s, o) => s + (o.updatedAt.getTime() - o.createdAt.getTime()),
            0,
          ) /
          ready.length /
          86400000
        ).toFixed(2)
      : null;

    const openStatuses: OrderStatus[] = [
      'DRAFT',
      'ACCEPTED',
      'IN_PROGRESS',
      'APPROVAL',
      'SENT',
    ];
    const openOrders = await this.prisma.order.findMany({
      where: { orderStatus: { in: openStatuses } },
      select: {
        id: true,
        number: true,
        orderStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const now = Date.now();
    const ageStatsByStatus = Object.fromEntries(
      openStatuses.map((s) => [
        s,
        {
          count: 0,
          oldest: null as null | {
            id: string;
            number: string | null;
            ageDaysCreated: number;
            ageDaysUpdated: number;
          },
          p50: 0,
          p90: 0,
          p99: 0,
        },
      ]),
    );

    function percentile(sorted: number[], p: number) {
      if (!sorted.length) return 0;
      const idx = Math.min(
        sorted.length - 1,
        Math.floor((p / 100) * sorted.length),
      );
      return sorted[idx];
    }

    // собираем метрики по статусам
    for (const s of openStatuses) {
      const arr = openOrders.filter((o) => o.orderStatus === s);
      const agesCreated = arr
        .map((o) => (now - o.createdAt.getTime()) / 86400000)
        .sort((a, b) => a - b);
      const agesUpdated = arr
        .map((o) => (now - o.updatedAt.getTime()) / 86400000)
        .sort((a, b) => a - b);
      const oldest = arr[0]; // т.к. orderBy: {createdAt:'asc'}

      ageStatsByStatus[s] = {
        count: arr.length,
        oldest: oldest
          ? {
              id: oldest.id,
              number: oldest.number ?? null,
              ageDaysCreated: +(
                (now - oldest.createdAt.getTime()) /
                86400000
              ).toFixed(2),
              ageDaysUpdated: +(
                (now - oldest.updatedAt.getTime()) /
                86400000
              ).toFixed(2),
            }
          : null,
        p50: +percentile(agesUpdated, 50).toFixed(2),
        p90: +percentile(agesUpdated, 90).toFixed(2),
        p99: +percentile(agesUpdated, 99).toFixed(2),
      };
    }

    // SLA-пороги (ENV или дефолты). Формат в ENV: ADMIN_SLA_JSON='{"DRAFT":"2d","ACCEPTED":"2d","IN_PROGRESS":"5d","APPROVAL":"3d","SENT":"7d"}'
    const defaultSla: Record<OrderStatus, string> = {
      DRAFT: '2d',
      ACCEPTED: '2d',
      IN_PROGRESS: '5d',
      APPROVAL: '3d',
      SENT: '7d',
      READY: '0d',
    };
    let slaCfg: Record<OrderStatus, string> = defaultSla;
    try {
      if (process.env.ADMIN_SLA_JSON)
        slaCfg = { ...defaultSla, ...JSON.parse(process.env.ADMIN_SLA_JSON) };
    } catch {}

    const ms = (n: number) => n;
    const DUR = (s: string) => {
      const m = String(s)
        .trim()
        .toLowerCase()
        .match(/^(\d+)\s*([dhm])$/);
      if (!m) return 0;
      const n = +m[1],
        u = m[2];
      return u === 'd' ? n * 86400000 : u === 'h' ? n * 3600000 : n * 60000;
    };

    type Breach = {
      id: string;
      number: string | null;
      status: OrderStatus;
      ageHours: number;
      thresholdHours: number;
    };
    const breachesByStatus: Record<OrderStatus, number> = {
      DRAFT: 0,
      ACCEPTED: 0,
      IN_PROGRESS: 0,
      APPROVAL: 0,
      SENT: 0,
      READY: 0,
    };
    const topBreaches: Breach[] = [];

    for (const o of openOrders) {
      const thMs = DUR(slaCfg[o.orderStatus] || '0d');
      const ageMs = now - o.updatedAt.getTime(); // считаем «простоял без движения»
      if (ageMs > thMs) {
        breachesByStatus[o.orderStatus] += 1;
        topBreaches.push({
          id: o.id,
          number: o.number ?? null,
          status: o.orderStatus,
          ageHours: +(ageMs / 3600000).toFixed(1),
          thresholdHours: +(thMs / 3600000).toFixed(1),
        });
      }
    }
    topBreaches.sort((a, b) => b.ageHours - a.ageHours);
    const topBreaches5 = topBreaches.slice(0, 5);

    const revenueAgg = await this.prisma.orderItem.aggregate({
      _sum: { unitPriceMinor: true },
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        order: { orderStatus: { not: 'DRAFT' } },
      },
    });
    const revenuePeriodMinor = revenueAgg._sum.unitPriceMinor ?? 0;

    // GMV и AOV по READY
    const readyOrders = await this.prisma.order.findMany({
      where: {
        orderStatus: 'READY',
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { totalMinor: true },
    });
    const revenueReadyMinor = readyOrders.reduce(
      (s, o) => s + (o.totalMinor ?? 0),
      0,
    );
    const aovReadyMinor = readyOrders.length
      ? Math.round(revenueReadyMinor / readyOrders.length)
      : 0;

    return {
      range: { from: fromDate.toISOString(), to: toDate.toISOString(), grain },
      ordersByStatus,
      newOrdersSeries: series,
      topTemplates,
      sizeDistribution,
      finishUsage,
      attachments,
      avgLeadTimeReadyDays,

      // новое:
      queueAging: ageStatsByStatus,
      sla: {
        thresholds: slaCfg,
        breachesByStatus,
        topBreaches: topBreaches5,
      },
      money: {
        currency: 'RUB',
        revenuePeriodMinor,
        revenueReadyMinor,
        aovReadyMinor,
      },
    };
  }
}

/** агрегатор по день/неделя/месяц в JS */
function bucketTimeSeries(
  dates: Date[],
  from: Date,
  to: Date,
  grain: 'day' | 'week' | 'month',
) {
  const start = startOf(from, grain);
  const end = endOf(to, grain);
  const labels: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    labels.push(keyOf(cursor, grain));
    step(cursor, grain);
  }
  const counts = Object.fromEntries(labels.map((l) => [l, 0]));
  for (const d of dates) {
    const k = keyOf(d, grain);
    if (k in counts) counts[k] += 1;
  }
  return labels.map((l) => ({ bucket: l, count: counts[l] }));
}

function startOf(d: Date, g: 'day' | 'week' | 'month') {
  const x = new Date(d);
  if (g === 'day') {
    x.setHours(0, 0, 0, 0);
    return x;
  }
  if (g === 'week') {
    const day = (x.getDay() + 6) % 7; // ISO week, Monday=0
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  // month
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOf(d: Date, g: 'day' | 'week' | 'month') {
  const x = new Date(d);
  if (g === 'day') {
    x.setHours(23, 59, 59, 999);
    return x;
  }
  if (g === 'week') {
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() + (6 - day));
    x.setHours(23, 59, 59, 999);
    return x;
  }
  // month
  x.setMonth(x.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}
function keyOf(d: Date, g: 'day' | 'week' | 'month') {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (g === 'day') return `${y}-${m}-${day}`;
  if (g === 'week') {
    // approximate ISO week label: yyyy-Www by Monday-start
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    const dayN = (dd.getDay() + 6) % 7;
    dd.setDate(dd.getDate() - dayN);
    const weekStart = dd.toISOString().slice(0, 10);
    return `W:${weekStart}`; // «неделя, начавшаяся в ...»
  }
  return `${y}-${m}`;
}
