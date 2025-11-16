'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { labelOf, orderStatusLabels } from '@utils';
import type { OrderStatusEnum } from '@types';

const statusLabel = labelOf<OrderStatusEnum>(orderStatusLabels);
const STATUSES = Object.keys(orderStatusLabels) as OrderStatusEnum[];

export function OrdersFilterBar() {
  const sp = useSearchParams();
  const r = useRouter();

  const [status, setStatus] = useState<string>(sp.get('status') || '');
  const [user, setUser] = useState<string>(
    sp.get('userEmail') || sp.get('userId') || '',
  );
  const [dateFrom, setDateFrom] = useState<string>(sp.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState<string>(sp.get('dateTo') || '');

  useEffect(() => {
    setStatus(sp.get('status') || '');
    setUser(sp.get('userEmail') || sp.get('userId') || '');
    setDateFrom(sp.get('dateFrom') || '');
    setDateTo(sp.get('dateTo') || '');
  }, [sp]);

  const apply = () => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);

    if (user) {
      if (user.includes('@')) q.set('userEmail', user);
      else q.set('userId', user);
    }

    if (dateFrom) q.set('dateFrom', dateFrom);
    if (dateTo) q.set('dateTo', dateTo);
    q.set('page', '1');

    r.push(`/admin/orders?${q.toString()}`);
  };

  const reset = () => r.push('/admin/orders');

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
    <div className="bg-white border rounded-xl p-3 mb-4 flex flex-wrap gap-4 items-end">
      <label className="text-sm">
        <span className="block mb-1 text-neutral-600">Статус</span>
        <select
          className="border rounded-md px-2 py-1 bg-white min-w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">—</option>
          {statusOptions}
        </select>
      </label>

      <label className="text-sm">
        <span className="block mb-1 text-neutral-600">Пользователь</span>
        <input
          className="border rounded-md px-2 py-1 bg-white min-w-64"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="email или userId"
        />
      </label>

      <label className="text-sm">
        <span className="block mb-1 text-neutral-600">От даты</span>
        <input
          type="date"
          className="border rounded-md px-2 py-1 bg-white"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </label>

      <label className="text-sm">
        <span className="block mb-1 text-neutral-600">До даты</span>
        <input
          type="date"
          className="border rounded-md px-2 py-1 bg-white"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </label>

      <div className="ml-auto flex gap-2">
        <button
          onClick={apply}
          className="px-3 py-1.5 rounded-md bg-neutral-900 text-white"
        >
          Фильтр
        </button>
        <button onClick={reset} className="px-3 py-1.5 rounded-md border">
          Сброс
        </button>
      </div>
    </div>
  );
}
