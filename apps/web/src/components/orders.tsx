'use client';

import useSWR from 'swr';
import Link from 'next/link';
import React, { useMemo } from 'react';
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
      <Link
        href={`/admin/orders/bulk-status${qs ? `?${qs}` : ''}`}
        className="rounded-lg border px-3 py-2 w-fit block"
      >
        Массовая смена статуса
      </Link>
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
                    {orderLabel(o.orderStatus as OrderStatusEnum)}
                  </div>
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
                          {invoiceLabel(o.invoice.status as InvoiceStatusEnum)}
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
