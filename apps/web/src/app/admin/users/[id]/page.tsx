'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch } from '@utils';
import { CustomerOrder } from '@types';
import Link from 'next/link';
import { useState } from 'react';
import { Loader } from '../../../../components/loader';
import {
  labelOf,
  orderStatusLabels,
  holePatternLabels,
  roleLabels,
} from '@utils';

const orderLabel = labelOf<string>(orderStatusLabels);
const holePatternLabel = labelOf<string>(holePatternLabels);
const roleLabel = labelOf<string>(roleLabels);

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, mutate } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  const [loading, setLoading] = useState(false);
  if (loading) {
    return <Loader />;
  }

  const renderKontragent = () => {
    if (data?.user.kontragentId) {
      return (
        <div className="flex flex-col items-end">
          <div>Можно выставлять счета </div>
          <div className="mt-[10px]">
            {data?.user?.customerOrders.length > 0 && (
              <Link
                href={`/admin/users/${id}/invoice`}
                className="bg-[#f1f1f1] border rounded-md p-[10px] cursor-pointer inline-block"
              >
                Сформировать счет
              </Link>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-end">
        Добавить контрагентом для выставления счетов:
        <div
          onClick={syncContrAgent}
          className="bg-[#f1f1f1] border rounded-md p-[10px] cursor-pointer inline-block mt-[10px]"
        >
          Добавить
        </div>
      </div>
    );
  };
  async function syncContrAgent() {
    setLoading(true);
    const res = await adminApiFetch(`/api/sync/${data.user.inn}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      setLoading(false);
      await mutate(
        await adminApiFetch(`/api/admin/users/${id}`).then((r) => r.json()),
        { revalidate: false },
      );
    }
  }

  const renderOrders = () => {
    if (data?.user?.customerOrders.length > 0) {
      return (
        <div>
          <div className="mb-[10px]">Заказы:</div>
          {data?.user?.customerOrders.map((order: CustomerOrder) => {
            const createdAt = new Date(order.createdAt);
            return (
              <div
                key={order.id}
                className="border rounded-xl mb-[20px] p-[10px]"
              >
                <div className="flex w-96">
                  <div className="w-1/2 text-right">Статус:</div>
                  <div className="w-1/2 text-right">
                    {orderLabel(order.orderStatus)}
                  </div>
                </div>
                <div className="flex w-96">
                  <div className="w-1/2 text-right">Добавлен в счет:</div>
                  <div className="w-1/2 text-right">
                    {order.includedInInvoice
                      ? `№${order.invoiceName}`
                      : 'Не добавлен'}
                  </div>
                </div>
                <div className="flex w-96">
                  <div className="w-1/2 text-right">Создан:</div>
                  <div className="w-1/2 text-right">
                    {createdAt.toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className="flex w-96">
                  <div className="w-1/2 text-right">Позиции:</div>
                  <div className="w-1/2 text-right">
                    {order?.items && (
                      <div key={order?.items.id}>
                        <p>{order?.items.templateLabel}</p>
                        <p>Размер: {order?.items.sizeId}</p>
                        {order?.items.frameId && (
                          <p>Вид рамки:{order?.items.frameId}</p>
                        )}
                        <p>Вид фона: {order?.items.backgroundId}</p>
                        <p>
                          Отверстия:&nbsp;
                          {holePatternLabel(order?.items.holePattern)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (data && data.user) {
    const createdAt = new Date(data.user.createdAt);
    const updatedAt = new Date(data.user.updatedAt);
    return (
      <div data-qa="UserDetails">
        <div className="flex justify-between">
          <div>
            <div className="flex w-96">
              <div className="w-1/2">Создан</div>
              <div className="w-1/2">{createdAt.toLocaleString('ru-RU')}</div>
            </div>
            <div className="flex w-96">
              <div className="w-1/2">Email</div>
              <div className="w-1/2">{data.user.email}</div>
            </div>
            <div className="flex w-96">
              <div className="w-1/2">ID</div>
              <div className="w-1/2">{data.user.id}</div>
            </div>
            <div className="flex w-96">
              <div className="w-1/2">Имя</div>
              <div className="w-1/2">{data.user.name}</div>
            </div>
            <div className="flex w-96">
              <div className="w-1/2">Телефон</div>
              <div className="w-1/2">{data.user.phone}</div>
            </div>
            {data.user.legalName && (
              <div className="flex w-96">
                <div className="w-1/2">Организация</div>
                <div className="w-1/2">{data.user.legalName}</div>
              </div>
            )}
            {data.user.address && (
              <div className="flex w-96">
                <div className="w-1/2">Адрес</div>
                <div className="w-1/2">{data.user.address}</div>
              </div>
            )}
            {data.user.inn && (
              <div className="flex w-96">
                <div className="w-1/2">ИНН</div>
                <div className="w-1/2">{data.user.inn}</div>
              </div>
            )}
            <div className="flex w-96">
              <div className="w-1/2">Статус</div>
              <div className="w-1/2">{roleLabel(data.user.role)}</div>
            </div>
            <div className="flex w-96">
              <div className="w-1/2">Изменен</div>
              <div className="w-1/2">{updatedAt.toLocaleString('ru-RU')}</div>
            </div>
          </div>
          {renderKontragent()}
        </div>
        {renderOrders()}
      </div>
    );
  }
  return <div>...загрузка</div>;
}
