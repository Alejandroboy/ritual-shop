'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { adminApiFetch, bytesToSize } from '@utils';
import AssetThumb from '../../../../components/asset-thumb';
import { OrderItemDetails, OrderStatus } from '@types';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, mutate } = useSWR(`/api/admin/orders/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  const [busy, setBusy] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>(data?.orderStatus);
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState<string>(
    data?.orderStatus,
  );
  useEffect(() => {
    setOrderStatus(data?.orderStatus);
  }, [data?.orderStatus]);

  if (!data) return null;

  const orderStatusList = Object.values(OrderStatus).filter(
    (item) => typeof item === 'string',
  );

  async function setStatus(status: string) {
    setBusy(true);
    await adminApiFetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    setOrderStatus(status);
    mutate();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Заказ {data.number}</h1>
      <div className="space-y-0 flex flex-wrap justify-between max-w-500">
        <p className="px-3 py-1 border rounded-xl mb-4 mr-8">
          Текущий статус: {orderStatus}
        </p>
      </div>
      <div className="space-y-0">
        <label className="text-sm">
          <select
            className="border rounded-md px-2 py-1 bg-white"
            value={updatedOrderStatus}
            onChange={(e) => setUpdatedOrderStatus(e.target.value)}
          >
            <option value="">—</option>
            {orderStatusList.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={busy}
          onClick={() => setStatus(updatedOrderStatus)}
          className="px-3 py-1 border rounded-xl cursor-pointer mb-4 mr-8 ml-[10px]"
        >
          Сменить статус
        </button>
      </div>
      <div>
        <h2 className="font-semibold">Заказчик</h2>
        <p>{data.customer.name}</p>
        <p>{data.customer.email}</p>
        <p>{data.customer.phone}</p>
      </div>
      <div>
        <h2 className="font-semibold">Позиции</h2>
        {data.items.map((it: OrderItemDetails) => (
          <div key={it.id} className="border rounded-xl p-3 my-2">
            <div className="text-sm">{it.templateCode}</div>
            <div className="text-sm">{it.templateLabel}</div>
            <div className="text-sm">Вид фона: {it.backgroundId}</div>
            <div className="text-sm">Вид рамки: {it.frameId}</div>
            <ul className="text-sm mt-2">
              {it.assets.map((a) => (
                <div key={a.id} className="text-xs">
                  <AssetThumb asset={a} size={120} />
                  <div className="mt-1 truncate max-w-[120px]">
                    {a.originalName || 'файл'}
                  </div>
                  <div className="text-gray-500">
                    {bytesToSize(a.size || 0)}
                  </div>
                </div>
              ))}
            </ul>
            {!!it.retouchNeeded && (
              <p>
                <b> Нужна ретушь!</b>
              </p>
            )}
            {!!it.approveNeeded && (
              <p>
                <b>Нужно согласование!</b>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
