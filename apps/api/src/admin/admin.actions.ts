import { Prisma, type $Enums } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function enumValues(): string[] {
  const e = Prisma.dmmf.datamodel.enums.find((x) => x.name === 'OrderStatus');
  return e
    ? e.values.map((v: any) => (typeof v === 'string' ? v : v.name))
    : [];
}
/** Читаем значения enum OrderStatus из DMMF (работает в Prisma 5/6) */
function readOrderStatusValues(): $Enums.OrderStatus[] {
  const dmmf: any = (require('@prisma/client') as any).Prisma?.dmmf;
  const enums = dmmf?.schema?.enums ?? dmmf?.datamodel?.enums ?? [];
  const e = enums.find((x: any) => x?.name === 'OrderStatus');
  const values = (e?.values ?? []).map((v: any) =>
    typeof v === 'string' ? v : v?.name,
  );
  return values as $Enums.OrderStatus[];
}

const ORDER_STATUS_VALUES = readOrderStatusValues();

/** Поток статусов: из ENV (фильтруем по enum) или весь enum по умолчанию */
function getFlow(): $Enums.OrderStatus[] {
  const fromEnv = (process.env.ADMIN_STATUS_FLOW || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as string[];

  const filtered = fromEnv.filter((v): v is $Enums.OrderStatus =>
    ORDER_STATUS_VALUES.includes(v as $Enums.OrderStatus),
  );

  return filtered.length ? filtered : ORDER_STATUS_VALUES;
}

const FLOW = getFlow();

function normalizeCurrent(raw?: string): $Enums.OrderStatus {
  if (raw && ORDER_STATUS_VALUES.includes(raw as $Enums.OrderStatus)) {
    return raw as $Enums.OrderStatus;
  }
  return FLOW[0];
}

function calcNext(current: $Enums.OrderStatus): $Enums.OrderStatus {
  const i = Math.max(0, FLOW.indexOf(current));
  return FLOW[Math.min(i + 1, FLOW.length - 1)] || current;
}

function nextStatus(current: string, flow: string[]) {
  const i = Math.max(0, flow.indexOf(current));
  return flow[Math.min(i + 1, flow.length - 1)] || current;
}

export function buildOrderActions(prisma: PrismaService) {
  const flow = getFlow();

  return {
    advanceStatus: {
      actionType: 'record',
      icon: 'ChevronRight',
      label: 'Следующий статус',
      isVisible: true,
      handler: async (_req: any, _res: any, ctx: any) => {
        try {
          const { record, h, resource } = ctx;
          if (!record) {
            return {
              record: undefined,
              notice: { message: 'Запись не найдена', type: 'error' },
            };
          }

          // Явно берём id и текущее значение enum
          const id =
            typeof record.id === 'function' ? record.id() : record.get('id');
          const currentRaw = record.get('orderStatus') as string | undefined;
          const current = normalizeCurrent(currentRaw);
          const next = calcNext(current);

          if (!id) {
            return {
              notice: {
                message: 'Не удалось определить ID записи',
                type: 'error',
              },
            };
          }
          if (next === current) {
            return {
              notice: { message: 'Уже финальный статус', type: 'info' },
              record: record.toJSON(),
            };
          }

          // Прямой апдейт через Prisma – минуем особенности адаптера
          const updated = await prisma.order.update({
            where: { id },
            data: { orderStatus: { set: next } },
            select: { id: true, orderStatus: true },
          });

          const fresh = await resource.findOne(id, ctx); // BaseRecord | null
          const recJson = fresh
            ? fresh.toJSON(ctx.currentAdmin)
            : record.toJSON();

          return {
            record: recJson,
            notice: {
              message: `Статус: ${current} → ${next}`,
              type: 'success',
            },
            redirectUrl: h.recordActionUrl({
              resourceId: resource._decorated?.id?.() ?? resource.id?.(),
              recordId: updated.id,
              actionName: 'show',
            }),
          };
        } catch (e: any) {
          console.error(
            '[Admin advanceStatus] ERROR:',
            e?.code,
            e?.message,
            e?.meta ?? '',
          );
          return {
            notice: {
              message: e?.message || 'Internal error in action',
              type: 'error',
            },
          };
        }
      },
      component: false,
    },
  } as const;
}
