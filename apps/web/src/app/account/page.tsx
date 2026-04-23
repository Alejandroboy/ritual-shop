'use client';

import React, { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAppStore } from '@state';
import { LogoutButton } from '../../components/logout-button';
import { isExtendError } from '../../utils/is-extended-error';
import { useHydrated } from '../../utils/use-hydrated';
import { labelOf, orderStatusLabels } from '@utils';
import { SubscribeTelegramButton } from '../../components/subscribe-telegram-button';
import { OrderItem } from '../../components/order-item';
import Link from 'next/link';

const orderLabel = labelOf<string>(orderStatusLabels);

function Account() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const hydrated = useHydrated();

  const page = Math.max(1, Number(sp.get('page') ?? '1'));
  const pageSize = Math.max(1, Number(sp.get('pageSize') ?? '10'));

  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);

  const myOrders = useAppStore((s) => s.myOrders);
  const loadMyOrders = useAppStore((s) => s.loadMyOrders);
  const isLoading = useAppStore((s) => s.isLoadingOrders);

  const ordersTotal = useAppStore((s) => s.ordersTotal);
  const ordersPage = useAppStore((s) => s.ordersPage);
  const ordersPageSize = useAppStore((s) => s.ordersPageSize);

  function errorHandler(e: unknown) {
    const message = e instanceof Error ? e.message : '';

    const status: number = isExtendError(e)
      ? Number.parseInt(e.status, 10) || 0
      : /\b401\b|\bunauth/i.test(message)
        ? 401
        : 0;

    if (status === 401 || status === 403) {
      router.replace('/login');
      return;
    }
  }

  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      try {
        await fetchMe();
      } catch (e: unknown) {
        errorHandler(e);
        console.error('AccountPage fetchMe error:', e);
      }
    })();
  }, [hydrated, fetchMe, router]);

  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      try {
        await loadMyOrders(page, pageSize);
      } catch (e: unknown) {
        errorHandler(e);
        console.error('AccountPage loadMyOrders error:', e);
      }
    })();
  }, [hydrated, loadMyOrders, page, pageSize, router]);

  const totalPages = Math.max(1, Math.ceil(ordersTotal / ordersPageSize));

  function setQuery(next: Record<string, string | number | null>) {
    const params = new URLSearchParams(sp.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(nextPage: number) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setQuery({ page: safePage });
  }

  function changePageSize(nextPageSize: number) {
    setQuery({
      pageSize: nextPageSize,
      page: 1,
    });
  }

  const pages = useMemo(() => {
    const result: number[] = [];
    const start = Math.max(1, ordersPage - 2);
    const end = Math.min(totalPages, ordersPage + 2);

    for (let p = start; p <= end; p += 1) {
      result.push(p);
    }

    return result;
  }, [ordersPage, totalPages]);

  if (!hydrated || !me) {
    return <div className="max-w-3xl mx-auto p-6">Загрузка…</div>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Личный кабинет</h1>
          <p className="mt-1 text-sm text-gray-500">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Мои заказы</h2>
          <SubscribeTelegramButton
            userId={me.id}
            telegramChatId={me.telegramChatId}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">На странице:</span>
            <select
              className="rounded-lg border px-3 py-2"
              value={ordersPageSize}
              onChange={(e) => changePageSize(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {isLoading
            ? 'Загрузка заказов...'
            : `Всего заказов: ${ordersTotal}. Страница ${ordersPage} из ${totalPages}`}
        </div>

        {!isLoading && (!myOrders || myOrders.length === 0) ? (
          <div className="text-sm text-gray-600">Нет заказов</div>
        ) : (
          myOrders?.map((order) => {
            const createdAt = new Date(order.createdAt);

            return (
              <div
                key={order.id}
                className={`space-y-3 rounded-xl border p-4 ${
                  order.orderStatus === 'APPROVAL' &&
                  order?.items?.userActionNeeded
                    ? 'border-red-600'
                    : ''
                }`}
              >
                <div className="flex flex-col gap-1 text-sm md:flex-row md:items-center md:justify-between">
                  <div>Заказ № {order.orderNumber}</div>
                  <div>Создан {createdAt.toLocaleString('ru-RU')}</div>
                  <div>Статус: {orderLabel(order.orderStatus)}</div>
                </div>

                <OrderItem userId={me.id} orderId={order.id} {...order.items} />
                <Link
                  href={`/account/${order.id}/items/${order.items.id}`}
                  className="rounded-xl px-4 py-2 bg-black text-white"
                >
                  Открыть
                </Link>
              </div>
            );
          })
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
            onClick={() => goToPage(ordersPage - 1)}
            disabled={ordersPage <= 1}
          >
            Назад
          </button>

          {pages[0] > 1 && (
            <>
              <button
                type="button"
                className="rounded-lg border px-3 py-2"
                onClick={() => goToPage(1)}
              >
                1
              </button>
              {pages[0] > 2 && <span className="px-1">…</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`rounded-lg border px-3 py-2 ${
                p === ordersPage ? 'bg-black text-white' : ''
              }`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className="px-1">…</span>
              )}
              <button
                type="button"
                className="rounded-lg border px-3 py-2"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
            onClick={() => goToPage(ordersPage + 1)}
            disabled={ordersPage >= totalPages}
          >
            Вперёд
          </button>
        </div>
      </section>
    </main>
  );
}

export default function AccountPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Suspense
        fallback={<div className="max-w-3xl mx-auto p-6">Загрузка…</div>}
      >
        <Account />
      </Suspense>
    </main>
  );
}
