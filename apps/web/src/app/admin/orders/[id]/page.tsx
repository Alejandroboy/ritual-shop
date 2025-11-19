'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { adminApiFetch, bytesToSize } from '@utils';
import { AssetThumb } from '../../../../components/asset-thumb';
import { OrderItemDetails, OrderStatusEnum } from '@types';
import { labelOf, orderStatusLabels } from '@utils';
import { useAppStore } from '@state';
import Link from 'next/link';
import { OrderItemsDetails } from '../../../../components/details';

const orderLabel = labelOf<string>(orderStatusLabels);

export default function OrderDetail() {
  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);
  const { id } = useParams<{ id: string }>();
  const { data, mutate } = useSWR(`/api/admin/orders/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  const [itemId, setItemId] = useState('');
  const [busy, setBusy] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>(data?.orderStatus);
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState<string>(
    data?.orderStatus,
  );

  useEffect(() => {
    if (!me) fetchMe().catch(() => {});
  }, [me, fetchMe]);

  useEffect(() => {
    setItemId(data?.items.id);
  }, [data?.items]);

  useEffect(() => {
    setOrderStatus(data?.orderStatus);
  }, [data?.orderStatus]);

  if (!data) return null;

  const orderStatusList = Object.values(OrderStatusEnum).filter(
    (item) => typeof item === 'string',
  );
  console.log('data', data);

  async function setStatus(status: string) {
    setBusy(true);
    await adminApiFetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, userId: me?.id }),
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
          Текущий статус: {orderLabel(orderStatus)}
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
                {orderLabel(h)}
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
        <p>{data?.customerName}</p>
        <p>{data?.customerEmail}</p>
        <p>{data?.customerPhone}</p>
      </div>
      <div>
        {itemId && (
          <OrderItemsDetails itemId={itemId} userId={data?.customer?.id} />
        )}
      </div>
    </div>
  );
}
