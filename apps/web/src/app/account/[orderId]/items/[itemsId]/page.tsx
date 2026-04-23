'use client';

import { useAppStore } from '@state';
import { useParams } from 'next/navigation';
import { OrderItem } from '../../../../../components/order-item';
import React, { useEffect, useState } from 'react';
import { labelOf, orderStatusLabels } from '@utils';
import { Board } from '../../../../../components/board';
import { type MyOrder } from '@state';

const orderLabel = labelOf<string>(orderStatusLabels);

export default function AccountOrderDetailsPage() {
  const me = useAppStore((s) => s.me);
  const loadMyOrder = useAppStore((s) => s.loadMyOrder);
  const { orderId, itemsId } = useParams<{
    orderId: string;
    itemsId: string;
  }>();

  const [order, setOrder] = useState<MyOrder | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const er = await loadMyOrder(orderId);
        setOrder(er);
      } catch (e: unknown) {
        console.error('AccountOrderDetailsPage loadMyOrder error:', e);
      }
    })();
  }, [loadMyOrder, me]);
  if (!order || !me) {
    return;
  }

  const createdAt = new Date(order.createdAt);
  return (
    <>
      <div className="flex justify-between">
        <div className="mr-[20px]">
          <div>
            <div className="font-medium">Заказ № {order.orderNumber}</div>
            <div className="font-medium">
              Создан {createdAt.toLocaleString('ru-RU')}
            </div>
            <div className="font-medium">
              Статус: {orderLabel(order.orderStatus)}
            </div>
          </div>

          <div>
            <div>
              <OrderItem userId={me.id} orderId={order.id} {...order.items} />
            </div>
          </div>
        </div>
        <div className="w-[400px]">
          <Board itemId={itemsId} orderId={orderId} userId={me.id} />
        </div>
      </div>
    </>
  );
}
