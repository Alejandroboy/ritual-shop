import React from 'react';
import { getApiBase } from '../../../utils/api-base';

async function fetchOrder(id: string) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/orders/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await fetchOrder(params.id);
  console.log('order', order);
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Заказ принят</h1>
      <p className="mb-4">
        Номер: <b>{order.orderNumber}</b>
      </p>
      <div>
        <div>
          Состав:&nbsp;
          <div>
            {order.items.map((item) => {
              return <p>{item.templateLabel}</p>;
            })}
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm text-neutral-600">
        <p>Статус: {order.orderStatus}</p>
        <p>
          Клиент: {order.customerName} · {order.customerPhone}
        </p>
      </div>
      <a href="/catalog" className="inline-block mt-6 underline">
        Вернуться в каталог
      </a>
    </div>
  );
}
