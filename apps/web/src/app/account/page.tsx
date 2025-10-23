'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../state/app-store';
import AssetThumb from '../../components/asset-thumb';
import { LogoutButton } from '../../components/logout-button';
import { bytesToSize } from '@utils';
import { isExtendError } from '../../utils/is-extended-error';
import { useHydrated } from '../../utils/use-hydrated';

export default function AccountPage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);

  const myOrders = useAppStore((s) => s.myOrders);
  const loadMyOrders = useAppStore((s) => s.loadMyOrders);
  const isLoading = useAppStore((s) => s.isLoadingOrders);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        await fetchMe();
        await loadMyOrders();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : '';

        const status: number = isExtendError(e)
          ? typeof e.status === 'string'
            ? Number.parseInt(e.status, 10) || 0
            : (e.status ?? 0)
          : /\b401\b|\bunauth/i.test(message)
            ? 401
            : 0;

        if (status === 401 || status === 403) {
          router.replace('/login'); // для app router: строкой, не объектом
          return;
        }

        console.error('AccountPage error:', e);
      }
    })();
  }, [hydrated, fetchMe, router, loadMyOrders]);

  if (!hydrated || isLoading || !me || !myOrders) {
    return <div className="max-w-3xl mx-auto p-6">Загрузка…</div>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Личный кабинет</h1>
          <p className="text-sm text-gray-500 mt-1">
            Добро пожаловать, {me.name || me.email}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="rounded-2xl border p-6">
        <h2 className="text-lg font-medium">Профиль</h2>
        <div className="mt-4 space-y-1 text-sm">
          <div>
            <span className="text-gray-500">Email:</span> {me.email}
          </div>
          <div>
            <span className="text-gray-500">Имя:</span> {me.name || '—'}
          </div>
          <div>
            <span className="text-gray-500">Телефон:</span> {me.phone || '—'}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-lg font-medium">Мои заказы</h2>

        {myOrders.length === 0 ? (
          <div className="text-sm text-gray-600">Нет заказов</div>
        ) : (
          myOrders.map((order) => {
            const createdAt = new Date(order.createdAt);
            return (
              <div key={order.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div>Заказ от {createdAt.toLocaleString('ru-RU')}</div>
                  <div>Статус: {order.orderStatus}</div>
                </div>

                {order.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="font-medium">{item.templateLabel}</div>
                    {item.comment && (
                      <div className="text-sm text-gray-600">
                        {item.comment}
                      </div>
                    )}

                    {!!item.assets.length && (
                      <div className="flex gap-3 flex-wrap">
                        {item.assets.map((a) => (
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
