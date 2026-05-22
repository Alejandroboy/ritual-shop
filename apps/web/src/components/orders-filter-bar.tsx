'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { labelOf, orderStatusLabels } from '@utils';
import type { OrderStatusEnum } from '@types';

const statusLabel = labelOf<OrderStatusEnum>(orderStatusLabels);
const STATUSES = Object.keys(orderStatusLabels) as OrderStatusEnum[];

export function OrdersFilterBar() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<string>(sp.get('status') || '');
  const [user, setUser] = useState<string>(
    sp.get('userEmail') || sp.get('userId') || '',
  );
  const [dateFrom, setDateFrom] = useState<string>(sp.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState<string>(sp.get('dateTo') || '');
  const [userNameContains, setUserNameContains] = useState<string>(
    sp.get('userNameContains') || '',
  );
  const [includedInInvoice, setIncludedInInvoice] = useState<string>(
    sp.get('includedInInvoice') || '',
  );
  const [invoiceStatus, setInvoiceStatus] = useState<string>(
    sp.get('invoiceStatus') || '',
  );
  const [orderNumber, setOrderNumber] = useState<string>(
    sp.get('orderNumber') || '',
  );

  useEffect(() => {
    setStatus(sp.get('status') || '');
    setUser(sp.get('userEmail') || sp.get('userId') || '');
    setDateFrom(sp.get('dateFrom') || '');
    setDateTo(sp.get('dateTo') || '');
    setUserNameContains(sp.get('userNameContains') || '');
    setIncludedInInvoice(sp.get('includedInInvoice') || '');
    setInvoiceStatus(sp.get('invoiceStatus') || '');
  }, [sp]);

  const apply = () => {
    const q = new URLSearchParams(sp.toString());

    if (status) q.set('status', status);
    else q.delete('status');

    if (userNameContains) q.set('userNameContains', userNameContains);
    else q.delete('userNameContains');

    if (includedInInvoice) {
      q.set('includedInInvoice', includedInInvoice);
    } else q.delete('includedInInvoice');

    if (invoiceStatus) {
      q.set('invoiceStatus', invoiceStatus);
    } else q.delete('invoiceStatus');

    if (orderNumber) {
      q.set('orderNumber', orderNumber);
    } else q.delete('orderNumber');

    q.delete('userEmail');
    q.delete('userId');

    const normalizedUser = user.trim();
    if (normalizedUser) {
      if (normalizedUser.includes('@')) q.set('userEmail', normalizedUser);
      else q.set('userId', normalizedUser);
    }

    if (dateFrom) q.set('dateFrom', dateFrom);
    else q.delete('dateFrom');

    if (dateTo) q.set('dateTo', dateTo);
    else q.delete('dateTo');
    q.set('page', '1');

    router.push(`${pathname}?${q.toString()}`);
  };

  const reset = () => {
    const q = new URLSearchParams(sp.toString());

    q.delete('status');
    q.delete('userEmail');
    q.delete('userNameContains');
    q.delete('userId');
    q.delete('dateFrom');
    q.delete('dateTo');
    q.delete('page');
    q.delete('invoiceStatus');
    q.delete('includedInInvoice');
    q.delete('orderNumber');

    router.push(`${pathname}${q.toString() ? `?${q.toString()}` : ''}`);
  };

  const statusOptions = useMemo(
    () =>
      STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      )),
    [],
  );

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
          {statusOptions}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">Имя пользователя</span>
        <input
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={userNameContains}
          onChange={(e) => setUserNameContains(e.target.value)}
          placeholder="Имя"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">Номер заказа</span>
        <input
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Номер заказа"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">Пользователь</span>
        <input
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="email или userId"
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
        <span className="mb-1 block text-neutral-600">Включен в счет</span>
        <select
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={includedInInvoice}
          onChange={(e) => setIncludedInInvoice(e.target.value)}
        >
          <option value="">—</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600">Статус оплаты</span>
        <select
          className="min-w-40 rounded-md border bg-white px-2 py-1"
          value={invoiceStatus}
          onChange={(e) => setInvoiceStatus(e.target.value)}
        >
          <option value="">—</option>
          <option value="yes">Оплачен</option>
          <option value="no">Не оплачен</option>
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
