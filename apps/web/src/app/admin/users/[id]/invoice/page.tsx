'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch } from '@utils';
import { CustomerOrder } from '@types';
import { useMemo, useState } from 'react';

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();

  const { data, mutate } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [positions, setPositions] = useState<
    { orderId: string; sku: string; priceMinor: number }[]
  >([]);
  const [ordersIds, setOrdersIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const user = data?.user;
  const orders: CustomerOrder[] = user?.customerOrders ?? [];

  const counterpartyId =
    user?.kontragentId ?? user?.moyskladCounterpartyId ?? null; // подстрой под реальное поле

  const toggleOrder = (order: CustomerOrder, checked: boolean) => {
    const orderId = order.id;

    const sku = (order.items as any).skuCode as string | undefined;

    const price = (order.items as any).template?.allowedSizes?.find(
      (x: any) => x.sizeId === (order.items as any).sizeId,
    )?.price as number | undefined;

    if (!sku || price == null) return;

    setSelected((s) => ({ ...s, [orderId]: checked }));

    if (checked) {
      setPositions((prev) => [
        ...prev,
        { orderId, sku, priceMinor: price * 100 },
      ]);
      setOrdersIds((prev) => [...prev, orderId]);
    } else {
      setPositions((prev) => prev.filter((p) => p.orderId !== orderId));
      setOrdersIds((prev) => prev.filter((x) => x !== orderId));
    }
  };

  // const aggregatedPositions = useMemo(() => {
  //   const map = new Map<
  //     string,
  //     { sku: string; qty: number; priceMinor: number }
  //   >();
  //
  //   for (const p of positions) {
  //     const cur = map.get(p.sku);
  //     if (!cur)
  //       map.set(p.sku, { sku: p.sku, qty: 1, priceMinor: p.priceMinor });
  //     else cur.qty += 1;
  //   }
  //
  //   return Array.from(map.values());
  // }, [positions]);

  const createInvoice = async () => {
    if (!counterpartyId) {
      alert(
        'Нет kontragentId/moyskladCounterpartyId у пользователя. Сначала сделай sync по ИНН.',
      );
      return;
    }
    if (ordersIds.length === 0 || positions.length === 0) {
      alert('Ничего не выбрано');
      return;
    }

    setBusy(true);
    try {
      const res = await adminApiFetch('/api/moy-sklad/invoiceout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterpartyId,
          orderIds: ordersIds,
          positions: positions.map((p) => ({
            sku: p.sku,
            qty: 1,
            priceMinor: p.priceMinor,
          })),
        }),
      });

      const text = await res.text();
      const json = text ? safeJson(text) : null;

      if (!res.ok) {
        const msg =
          (json as any)?.message ??
          (json as any)?.details?.message ??
          text ??
          'invoiceout failed';
        throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      }

      console.log('invoiceout created:', json);
      alert(
        `Счёт создан: ${(json as any)?.name ?? (json as any)?.number ?? (json as any)?.id ?? ''}`,
      );

      // обновим данные на странице (чтобы подтянулись invoiceName/includedInInvoice если ты их показываешь)
      await mutate();
      // или можно сбросить выбор
      setSelected({});
      setPositions([]);
      setOrdersIds([]);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Ошибка создания счёта');
    } finally {
      setBusy(false);
    }
  };

  if (!orders.length) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={createInvoice}
          disabled={busy || ordersIds.length === 0}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Создаю…' : `Создать счёт (${ordersIds.length})`}
        </button>

        <div className="text-sm opacity-70">
          Контрагент: {counterpartyId ?? 'не задан'}
        </div>
      </div>

      {orders.map((order: CustomerOrder) => {
        console.log('order', order);
        const createdAt = new Date(order.createdAt);

        const price = (order.items as any).template?.allowedSizes?.find(
          (x: any) => x.sizeId === (order.items as any).sizeId,
        )?.price;

        const title = (order.items as any).template?.fullTitle;
        const includedInInvoice = order.includedInInvoice;
        const invoiceName = order.invoiceName;
        return (
          <div
            key={order.id}
            className="border rounded-md px-4 py-3 mb-[10px] flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="font-semibold">{title}</div>
              <div>Цена: {price}</div>
              <div>Создан: {createdAt.toLocaleString('ru-RU')}</div>
              <div>
                Согласование {order.items.approveNeeded ? 'Нужно' : 'Не нужно'}
              </div>
              {order.items.approveNeeded && (
                <div>
                  Согласование получено: {order.items.approved ? 'Да' : 'Нет'}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              {includedInInvoice && <p>Добавлен в счет №{invoiceName}</p>}
              <input
                type="checkbox"
                className={`mt-2 h-6 w-6 accent-black ${includedInInvoice ? 'cursor-not-allowed' : 'cursor-pointer'} `}
                checked={selected[order.id] || false}
                disabled={includedInInvoice}
                onChange={(e) => toggleOrder(order, e.target.checked)}
              />
            </div>
          </div>
        );
      })}

      <pre className="mt-4 text-xs whitespace-pre-wrap">
        {JSON.stringify(
          {
            ordersIds,
            positions,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
