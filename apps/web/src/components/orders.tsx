'use client';

import useSWR from 'swr';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminApiFetch } from '@utils';
import {
  InvoiceStatusEnum,
  Order,
  OrderItemDetails,
  OrderStatusEnum,
} from '@types';
import { labelOf, orderStatusLabels, invoiceStatusLabel } from '@utils';
import { OrdersFilterBar } from './orders-filter-bar';
import { AssetThumb } from './asset-thumb';

function isOlderThanDays(
  dateValue: string | Date | null | undefined,
  days: number,
) {
  if (!dateValue) return false;

  const createdAt = new Date(dateValue);
  if (Number.isNaN(createdAt.getTime())) return false;

  const diffMs = Date.now() - createdAt.getTime();
  return diffMs > days * 24 * 60 * 60 * 1000;
}

function shouldHighlightOrder(order: Order) {
  const isOld = isOlderThanDays(order.createdAt as unknown as string, 7);

  const pendingStatuses: OrderStatusEnum[] = [
    OrderStatusEnum.IN_PROGRESS,
    OrderStatusEnum.ACCEPTED,
    OrderStatusEnum.APPROVAL,
  ];

  return (
    isOld && pendingStatuses.includes(order.orderStatus as OrderStatusEnum)
  );
}

export function Orders() {
  const [view, setView] = useState<'list' | 'table'>('table');
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(sp.get('page') ?? '1'));
  const pageSize = Math.max(1, Number(sp.get('pageSize') ?? '25'));

  const qs = sp.toString();
  const key = `/api/admin/orders${qs ? `?${qs}` : ''}`;

  const { data, isLoading } = useSWR(key, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  const items = data?.items ?? [];
  const total = Number(data?.total ?? 0);
  const currentPage = Number(data?.page ?? page);
  const currentPageSize = Number(data?.pageSize ?? pageSize);
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  const orderLabel = labelOf<string>(orderStatusLabels);
  const invoiceLabel = labelOf<string>(invoiceStatusLabel);

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

  function chooseClass(status: string): string {
    if (status === 'PAID') return 'text-green-600';
    return 'text-red-600';
  }

  const renderApproval = (item: OrderItemDetails) => {
    if (item?.approved && item?.approveNeeded) {
      return (
        <div className="text-sm text-gray-600">
          <span className="line-through">Нужно согласование</span>&nbsp;
          <span>Согласовано</span>
        </div>
      );
    }
    if (item?.approveNeeded) {
      return <div className="text-sm text-red-600">Нужно согласование</div>;
    }
    return null;
  };

  const renderRetouch = (item: OrderItemDetails) => {
    const retouchedAssets =
      item?.assets?.filter((asset) => asset.stage === 'RETOUCHED') ?? [];

    if (item?.retouchNeeded && retouchedAssets.length > 0) {
      return (
        <div className="text-sm text-gray-600">
          <span className="line-through">Нужна ретушь</span>&nbsp;
          <span>Ретушь добавлена</span>
        </div>
      );
    }

    if (item?.retouchNeeded) {
      return <div className="text-sm text-red-600">Нужна ретушь</div>;
    }

    return null;
  };

  const styleForBg = (orderStatus: string) => {
    if (orderStatus === OrderStatusEnum.IN_PROGRESS) {
      return 'bg-gray-50';
    }
    if (orderStatus === OrderStatusEnum.READY) {
      return 'bg-blue-50';
    }
    if (orderStatus === OrderStatusEnum.COMPLETED) {
      return 'bg-green-50';
    }
    if (orderStatus === OrderStatusEnum.APPROVAL) {
      return 'bg-yellow-50';
    }
    return '';
  };

  const pages = useMemo(() => {
    const result: number[] = [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i += 1) {
      result.push(i);
    }

    return result;
  }, [currentPage, totalPages]);

  return (
    <div>
      <OrdersFilterBar />
      <div className="flex items-center gap-3 mb-3">
        <Link
          href={`/admin/orders/bulk-status${qs ? `?${qs}` : ''}`}
          className="rounded-lg border px-3 py-2 w-fit block"
        >
          Массовая смена статуса
        </Link>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            className={`px-3 py-2 flex items-center gap-1.5 text-sm ${view === 'list' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
            onClick={() => setView('list')}
            title="Карточки"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="2"
                width="14"
                height="3"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="1"
                y="6.5"
                width="14"
                height="3"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="1"
                y="11"
                width="14"
                height="3"
                rx="1"
                fill="currentColor"
              />
            </svg>
            Карточки
          </button>
          <button
            className={`px-3 py-2 flex items-center gap-1.5 text-sm border-l ${view === 'table' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
            onClick={() => setView('table')}
            title="Таблица"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="6"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="9"
                y="1"
                width="6"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="1"
                y="9"
                width="6"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="9"
                y="9"
                width="6"
                height="6"
                rx="1"
                fill="currentColor"
              />
            </svg>
            Таблица
          </button>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {isLoading
            ? 'Загрузка...'
            : `Всего заказов: ${total}. Страница ${currentPage} из ${totalPages}`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">На странице:</span>
          <select
            className="border rounded-lg px-3 py-2"
            value={currentPageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-600">
                <th className="px-3 py-2 font-medium">Номер</th>
                <th className="px-3 py-2 font-medium">Статус</th>
                <th className="px-3 py-2 font-medium">Клиент</th>
                <th className="px-3 py-2 font-medium">Дата</th>
                <th className="px-3 py-2 font-medium">Счёт</th>
                <th className="px-3 py-2 font-medium">Флаги</th>
                <th className="px-3 py-2 font-medium">Согласовано</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o: Order) => {
                const created = o.createdAt
                  ? new Date(o.createdAt as unknown as string)
                  : null;
                const isDelayed = shouldHighlightOrder(o);

                return (
                  <tr
                    key={o.id}
                    className={`border-b ${isDelayed ? 'bg-red-50' : styleForBg(o.orderStatus)} hover:brightness-95`}
                  >
                    <td className="px-3 py-2 font-mono whitespace-nowrap">
                      {isDelayed && (
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 align-middle" />
                      )}
                      {o.number}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {orderLabel(o.orderStatus as OrderStatusEnum)}
                    </td>
                    <td className="px-3 py-2">
                      <div>{o.customerName ?? '—'}</div>
                      <div className="text-gray-500">
                        {o.customerEmail ?? '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                      {created ? created.toLocaleString('ru-RU') : '—'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {o.includedInInvoice ? (
                        <span>
                          {o.invoiceName}&nbsp;
                          {o?.invoice && (
                            <span className={chooseClass(o.invoice.status)}>
                              {invoiceLabel(
                                o.invoice.status as InvoiceStatusEnum,
                              )}
                            </span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        {o.items?.userActionNeeded &&
                          !o.items.managerActionNeeded && (
                            <span className="text-red-500 text-xs">
                              Ожидание пользователя
                            </span>
                          )}
                        {!o.items?.userActionNeeded &&
                          o.items?.managerActionNeeded && (
                            <span className="text-red-500 text-xs">
                              Ожидание менеджера
                            </span>
                          )}
                        {o.items?.approveNeeded && !o.items?.approved && (
                          <span className="text-red-500 text-xs">
                            Согласование
                          </span>
                        )}
                        {o.items?.retouchNeeded &&
                          (
                            o.items?.assets?.filter(
                              (a) => a.stage === 'RETOUCHED',
                            ) ?? []
                          ).length === 0 && (
                            <span className="text-red-500 text-xs">Ретушь</span>
                          )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {o.items?.approved && (
                        <span className="text-green-600">Согласовано</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link
                        className="underline"
                        href={`/admin/orders/${o.id}`}
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((o: Order) => {
            const orderStatus = o.orderStatus;
            const created = o.createdAt
              ? new Date(o.createdAt as unknown as string)
              : null;

            const isDelayed = shouldHighlightOrder(o);

            return (
              <li
                key={o.id}
                className={`p-3 rounded-xl border-2 ${
                  isDelayed ? 'border-red-500' : 'border-gray-200'
                }
              ${styleForBg(orderStatus)}
              `}
              >
                <div className="flex items-center gap-2 justify-between">
                  <div>
                    <div className="font-mono">{o.number}</div>
                    {renderRetouch(o.items)}
                    {renderApproval(o.items)}
                    <div className="text-sm text-gray-600">
                      Статус: {orderLabel(o.orderStatus as OrderStatusEnum)}
                    </div>
                    {o.items?.userActionNeeded &&
                      !o.items.managerActionNeeded && (
                        <span className="text-sm  text-red-500">
                          Ожидание пользователя
                        </span>
                      )}

                    {!o.items?.userActionNeeded &&
                      o.items?.managerActionNeeded && (
                        <span className="text-sm text-red-500">
                          Ожидание ответа от менеджера
                        </span>
                      )}
                    <div className="text-sm text-gray-500">
                      {created ? created.toLocaleString() : '—'}
                      {' • '}
                      {o.customerEmail ?? 'без пользователя'}
                      {' • '}
                      {o.customerName ?? 'без имени'}
                    </div>
                    {o.includedInInvoice && (
                      <div className="text-sm">
                        Включен в счет {o.invoiceName}&nbsp;
                        {o?.invoice ? (
                          <span className={chooseClass(o.invoice.status)}>
                            {invoiceLabel(
                              o.invoice.status as InvoiceStatusEnum,
                            )}
                          </span>
                        ) : null}
                      </div>
                    )}
                    <Link className="underline" href={`/admin/orders/${o.id}`}>
                      Открыть
                    </Link>
                  </div>
                  <div>
                    {o.items?.assets.length ? (
                      <AssetThumb
                        asset={{
                          id: o.items.assets[0].id,
                          originalName: o.items.assets[0].originalName,
                          contentType: o.items.assets[0].contentType,
                          thumbKey: o.items.assets[0].thumbKey,
                          s3Key: o.items.assets[0].key,
                        }}
                        size={180}
                        primary={o.items.assets[0].primary}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Назад
        </button>

        {pages[0] > 1 && (
          <>
            <button
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
            className={`rounded-lg border px-3 py-2 ${
              p === currentPage ? 'bg-black text-white' : ''
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
              className="rounded-lg border px-3 py-2"
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
