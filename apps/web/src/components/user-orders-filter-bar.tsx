'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { labelOf, orderStatusLabels } from '@utils';
import type { OrderStatusEnum } from '@types';

const statusLabel = labelOf<OrderStatusEnum>(orderStatusLabels);
const STATUSES = Object.keys(orderStatusLabels) as OrderStatusEnum[];

export function UserOrdersFilterBar() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState(sp.get('status') || '');
  const [q, setQ] = useState(sp.get('q') || '');
  const [dateFrom, setDateFrom] = useState(sp.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(sp.get('dateTo') || '');
  const [includedInInvoice, setIncludedInInvoice] = useState(
    sp.get('includedInInvoice') || '',
  );

  useEffect(() => {
    setStatus(sp.get('status') || '');
    setQ(sp.get('q') || '');
    setDateFrom(sp.get('dateFrom') || '');
    setDateTo(sp.get('dateTo') || '');
    setIncludedInInvoice(sp.get('includedInInvoice') || '');
  }, [sp]);

  const apply = () => {
    const params = new URLSearchParams(sp.toString());

    if (status) params.set('status', status);
    else params.delete('status');
    if (q) params.set('q', q);
    else params.delete('q');
    if (dateFrom) params.set('dateFrom', dateFrom);
    else params.delete('dateFrom');
    if (dateTo) params.set('dateTo', dateTo);
    else params.delete('dateTo');
    if (includedInInvoice) params.set('includedInInvoice', includedInInvoice);
    else params.delete('includedInInvoice');
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
  };

  const reset = () => {
    const params = new URLSearchParams(sp.toString());
    [
      'status',
      'q',
      'dateFrom',
      'dateTo',
      'includedInInvoice',
      'invoiceStatus',
      'page',
    ].forEach((k) => params.delete(k));
    router.push(
      `${pathname}${params.toString() ? `?${params.toString()}` : ''}`,
    );
  };

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border bg-white p-3">
      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">Статус</span>
        <select
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">—</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">Номер заказа</span>
        <input
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="Поиск"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">От даты</span>
        <input
          type="date"
          className="rounded-md border bg-white px-2 py-1"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">До даты</span>
        <input
          type="date"
          className="rounded-md border bg-white px-2 py-1"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">В счете</span>
        <select
          className="min-w-32 rounded-md border bg-white px-2 py-1"
          value={includedInInvoice}
          onChange={(e) => setIncludedInInvoice(e.target.value)}
        >
          <option value="">—</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </label>

      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-white cursor-pointer"
        >
          Фильтр
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-3 py-1.5 cursor-pointer"
        >
          Сброс
        </button>
      </div>
    </div>
  );
}
