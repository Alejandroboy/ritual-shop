'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { adminApiFetch } from '@utils';

export default function Orders() {
  const { data } = useSWR('/api/admin/orders', (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  console.log('data');
  const items = data?.items ?? [];
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Заказы</h1>
      <ul className="space-y-2">
        {items.map((o: any) => {
          console.log('o', o);
          return (
            <li key={o.id} className="p-3 border rounded-xl">
              <div className="font-mono">{o.number}</div>
              <div className="text-sm text-gray-600">{o.orderStatus}</div>
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
