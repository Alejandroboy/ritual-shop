'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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

const STATUSES = Object.keys(orderStatusLabels) as OrderStatusEnum[];

type BulkResponse = {
  total: number;
  successCount: number;
  failCount: number;
  results: Array<{
    id: string;
    ok: boolean;
    skipped?: boolean;
    error?: string;
  }>;
};

export function BulkStatusOrders() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(sp.get('page') ?? '1'));
  const pageSize = Math.max(1, Number(sp.get('pageSize') ?? '25'));

  const qs = sp.toString();
  const key = `/api/admin/orders${qs ? `?${qs}` : ''}`;

  const { data, isLoading, mutate } = useSWR(key, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  const items = (data?.items ?? []) as Order[];
  const total = Number(data?.total ?? 0);
  const currentPage = Number(data?.page ?? page);
  const currentPageSize = Number(data?.pageSize ?? pageSize);
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  const [view, setView] = useState<'list' | 'table'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nextStatus, setNextStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<BulkResponse | null>(null);

  const orderLabel = labelOf<string>(orderStatusLabels);
  const invoiceLabel = labelOf<string>(invoiceStatusLabel);

  const pageOrderIds = useMemo(() => items.map((o) => o.id), [items]);

  const allOnPageSelected =
    pageOrderIds.length > 0 &&
    pageOrderIds.every((id) => selectedIds.includes(id));

  const someOnPageSelected =
    pageOrderIds.some((id) => selectedIds.includes(id)) && !allOnPageSelected;

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

  function toggleOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAllOnPage() {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageOrderIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageOrderIds])));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function applyBulkStatus() {
    if (!nextStatus || selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Сменить статус на "${orderLabel(nextStatus)}" для ${selectedIds.length} заказов?`,
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    setLastResult(null);

    try {
      const res = await adminApiFetch('/api/admin/orders/status/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          status: nextStatus,
        }),
      });

      const json = (await res.json()) as BulkResponse | { message?: string };

      if (!res.ok) {
        throw new Error(
          'message' in json && json.message
            ? json.message
            : 'Не удалось массово обновить статусы',
        );
      }

      const result = json as BulkResponse;
      setLastResult(result);

      const successIds = new Set(
        result.results.filter((x) => x.ok).map((x) => x.id),
      );

      setSelectedIds((prev) => prev.filter((id) => !successIds.has(id)));

      await mutate();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function chooseInvoiceClass(status: string): string {
    if (status === 'PAID') return 'text-green-600';
    return 'text-red-600';
  }

  function renderApproval(item: OrderItemDetails) {
    if (item?.approved && item?.approveNeeded) {
      return (
        <div className="text-sm text-gray-600">
          <span className="line-through">Нужно согласование</span>{' '}
          <span>Согласовано</span>
        </div>
      );
    }

    if (item?.approveNeeded) {
      return <div className="text-sm text-red-600">Нужно согласование</div>;
    }

    return null;
  }

  function renderRetouch(item: OrderItemDetails) {
    const retouchedAssets =
      item?.assets?.filter((asset) => asset.stage === 'RETOUCHED') ?? [];

    if (item?.retouchNeeded && retouchedAssets.length > 0) {
      return (
        <div className="text-sm text-gray-600">
          <span className="line-through">Нужна ретушь</span>{' '}
          <span>Ретушь добавлена</span>
        </div>
      );
    }

    if (item?.retouchNeeded) {
      return <div className="text-sm text-red-600">Нужна ретушь</div>;
    }

    return null;
  }

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
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/admin/orders${qs ? `?${qs}` : ''}`}
          className="rounded-lg border px-3 py-2"
        >
          ← Назад к списку
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

      <OrdersFilterBar />

      <div className="mb-4 rounded-xl border p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              {isLoading
                ? 'Загрузка...'
                : `Всего заказов: ${total}. Страница ${currentPage} из ${totalPages}`}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                ref={(node) => {
                  if (node) node.indeterminate = someOnPageSelected;
                }}
                onChange={toggleAllOnPage}
              />
              <span>Выбрать все на текущей странице</span>
            </label>

            <div className="text-sm text-gray-600">
              Выбрано: {selectedIds.length}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Новый статус</span>
              <select
                className="rounded-lg border px-3 py-2"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Выберите статус</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {orderLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-gray-600">На странице</span>
              <select
                className="rounded-lg border px-3 py-2"
                value={currentPageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
                disabled={isSubmitting}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>

            <button
              type="button"
              className="rounded-lg border px-3 py-2"
              onClick={clearSelection}
              disabled={selectedIds.length === 0 || isSubmitting}
            >
              Снять выделение
            </button>

            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={applyBulkStatus}
              disabled={!nextStatus || selectedIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Применяем...' : 'Применить'}
            </button>
          </div>
        </div>

        {lastResult && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
            <div>
              Успешно: {lastResult.successCount}, ошибок: {lastResult.failCount}
              , всего: {lastResult.total}
            </div>

            {lastResult.failCount > 0 && (
              <div className="mt-2 space-y-1 text-red-600">
                {lastResult.results
                  .filter((x) => !x.ok)
                  .map((x) => (
                    <div key={x.id}>
                      {x.id}: {x.error || 'Ошибка'}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-600">
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={allOnPageSelected}
                    ref={(node) => {
                      if (node) node.indeterminate = someOnPageSelected;
                    }}
                    onChange={toggleAllOnPage}
                    disabled={isSubmitting}
                  />
                </th>
                <th className="px-3 py-2 font-medium">Номер</th>
                <th className="px-3 py-2 font-medium">Статус</th>
                <th className="px-3 py-2 font-medium">Клиент</th>
                <th className="px-3 py-2 font-medium">Дата</th>
                <th className="px-3 py-2 font-medium">Счёт</th>
                <th className="px-3 py-2 font-medium">Флаги</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o: Order) => {
                const created = o.createdAt
                  ? new Date(o.createdAt as unknown as string)
                  : null;
                const checked = selectedIds.includes(o.id);

                return (
                  <tr
                    key={o.id}
                    className={`border-b hover:bg-gray-50 ${checked ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => toggleOne(o.id)}
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap">
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
                      {created ? created.toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {o.includedInInvoice ? (
                        <span>
                          {o.invoiceName}{' '}
                          {o.invoice && (
                            <span
                              className={chooseInvoiceClass(o.invoice.status)}
                            >
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
                        {Array.isArray(o.items) ? (
                          o.items.map((item) => (
                            <div key={item.id}>
                              {renderRetouch(item)}
                              {renderApproval(item)}
                            </div>
                          ))
                        ) : (
                          <>
                            {renderRetouch(o.items)}
                            {renderApproval(o.items)}
                          </>
                        )}
                      </div>
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
            const created = o.createdAt
              ? new Date(o.createdAt as unknown as string)
              : null;

            const checked = selectedIds.includes(o.id);

            return (
              <li key={o.id} className="rounded-xl border p-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={checked}
                    onChange={() => toggleOne(o.id)}
                    disabled={isSubmitting}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="font-mono">{o.number}</div>
                      <div className="text-sm text-gray-500">
                        ID: <span className="font-mono">{o.id}</span>
                      </div>
                    </div>

                    {Array.isArray(o.items) ? (
                      o.items.map((item) => (
                        <div key={item.id}>
                          {renderRetouch(item)}
                          {renderApproval(item)}
                        </div>
                      ))
                    ) : (
                      <>
                        {renderRetouch(o.items)}
                        {renderApproval(o.items)}
                      </>
                    )}

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
                        Включен в счет {o.invoiceName}{' '}
                        {o.invoice ? (
                          <span
                            className={chooseInvoiceClass(o.invoice.status)}
                          >
                            {invoiceLabel(
                              o.invoice.status as InvoiceStatusEnum,
                            )}
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className="mt-2 flex gap-3">
                      <Link
                        className="underline"
                        href={`/admin/orders/${o.id}`}
                      >
                        Открыть
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || isSubmitting}
        >
          Назад
        </button>

        {pages[0] > 1 && (
          <>
            <button
              type="button"
              className="rounded-lg border px-3 py-2"
              onClick={() => goToPage(1)}
              disabled={isSubmitting}
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
              p === currentPage ? 'bg-black text-white' : ''
            }`}
            onClick={() => goToPage(p)}
            disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages || isSubmitting}
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
