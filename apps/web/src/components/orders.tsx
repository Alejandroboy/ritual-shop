'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { adminApiFetch } from '@utils';
import { Order, OrderStatusEnum } from '@types';
import { labelOf, orderStatusLabels } from '@utils';
import { OrdersFilterBar } from './orders-filter-bar';

const orderLabel = labelOf<OrderStatusEnum>(orderStatusLabels);
export function Orders({ qs }: { qs: string }) {
  const key = `/api/admin/orders${qs ? `?${qs}` : ''}`;
  const { data } = useSWR(key, (u) => adminApiFetch(u).then((r) => r.json()));
  const items = data?.items ?? [];

  return (
    <div>
      <OrdersFilterBar />
      <ul className="space-y-2">
        {items.map((o: Order) => {
          const created = o.createdAt
            ? new Date(o.createdAt as unknown as string)
            : null;
          return (
            <li key={o.id} className="p-3 border rounded-xl">
              <div className="font-mono">{o.number}</div>
              <div className="text-sm text-gray-600">
                {orderLabel(o.orderStatus as OrderStatusEnum)}
              </div>
              <div className="text-sm text-gray-500">
                {created ? created.toLocaleString() : '—'}
                {' • '}
                {o.customerEmail ?? 'без пользователя'}
                {' • '}
                {o.customerName ?? 'без имени'}
              </div>
              <Link className="underline" href={`/admin/orders/${o.id}`}>
                Открыть
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
