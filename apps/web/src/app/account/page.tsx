'use client';
import { api } from '../../../api';
import { LogoutButton } from '../../components/logout-button';
import { useEffect, useState } from 'react';
import { router } from 'next/client';
type User = {
  userId: string;
  email: string;
  name: string;
  phone: string;
  customerOrders:
    | {
        createdAt: string;
        id: string;
        orderStatus: string;
        totalMinor: number;
        items:
          | {
              backgroundId: number;
              comment: string | null;
              createdAt: string;
              finish: string | null;
              frameId: string | null;
              holePattern: string;
              id: string;
              orderId: string;
              sizeId: string;
              templateCode: string;
              templateId: string;
              templateLabel: string;
              unitPriceMinor: number;
              updatedAt: string;
            }[]
          | [];
      }[]
    | [];
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    try {
      getUser();
    } catch {
      router.push('/login');
    }
  }, [router]);
  const getUser = async () => {
    const data = await api('/users/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', //
    });
    console.log('data', data);
    const { user } = data;
    setUser(user);
  };

  if (!user) {
    return <div>...Loading</div>;
  }

  const renderOrders = () => {
    if (user.customerOrders.length) {
      const { customerOrders } = user;
      return customerOrders.map((order) => {
        const createdAt = new Date(order.createdAt);
        return (
          <div key={order.id}>
            <h2>Заказ от {createdAt.toLocaleString('ru-RU')}</h2>
            <p>Статус: {order.orderStatus}</p>
            {order.items.map((orderItem) => {
              return (
                <ul key={orderItem.id}>
                  <li>{orderItem.templateLabel}</li>
                  {orderItem.comment && <li>{orderItem.comment}</li>}
                </ul>
              );
            })}
          </div>
        );
      });
    }
    return <div>Нет заказов</div>;
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Личный кабинет</h1>
          <p className="text-sm text-gray-500 mt-1">
            Добро пожаловать, {user.name || user.email}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="rounded-2xl border p-6">
        <h2 className="text-lg font-medium">Профиль</h2>
        <div className="mt-4 space-y-1 text-sm">
          <div>
            <span className="text-gray-500">Email:</span> {user.email}
          </div>
          <div>
            <span className="text-gray-500">Имя:</span> {user.name || '—'}
          </div>
          <div>
            <span className="text-gray-500">Телефон:</span> {user.phone || '—'}
          </div>
          <div>
            <span className="text-gray-500">Роль:</span> {user.role}
          </div>
        </div>
      </section>
      {renderOrders()}
      <section></section>
    </main>
  );
}
