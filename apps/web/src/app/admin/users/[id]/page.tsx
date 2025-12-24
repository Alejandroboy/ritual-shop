'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch } from '@utils';
import { CustomerOrder } from '@types';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const { data } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  if (data && data.user) {
    const createdAt = new Date(data.user.createdAt);
    const updatedAt = new Date(data.user.updatedAt);
    return (
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
          <div className="w-1/2">{data.user.role}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">Изменен</div>
          <div className="w-1/2">{updatedAt.toLocaleString('ru-RU')}</div>
        </div>
        {data?.user?.customerOrders.length && (
          <div>
            Заказы:
            {data?.user?.customerOrders.map((order: CustomerOrder) => {
              const createdAt = new Date(order.createdAt);
              return (
                <div key={order.id}>
                  <div className="flex w-96">
                    <div className="w-1/2 text-right">Статус:</div>
                    <div className="w-1/2 text-right">{order.orderStatus}</div>
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
                          <p>Вид рамки:{order?.items.frameId}</p>
                          <p>Вид фона: {order?.items.backgroundId}</p>
                          <p>Отверстия: {order?.items.holePattern}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  return <div>...загрузка</div>;
}
