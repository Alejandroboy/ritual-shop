'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApiFetch } from '@utils';
import useSWR from 'swr';
import UserDetails from './[id]/page';

type User = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
};
type ListResponse = {
  items: User[];
  total: number;
  skip: number;
  take: number;
};

export default function AdminUsersListPage() {
  // const [data, setData] = useState<ListResponse | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  // const params = new URLSearchParams();
  // if (qStr) params.set('q', qStr);
  // params.set('skip', String(skip));
  // params.set('take', String(take));
  const { data } = useSWR(`/api/admin/users/list`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  async function load(skip = 0, take = 20, qStr = q) {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (qStr) params.set('q', qStr);
      params.set('skip', String(skip));
      params.set('take', String(take));
      const { data } = useSWR(
        `/api/admin/users/list?${params.toString()}`,
        (u) => adminApiFetch(u).then((r) => r.json()),
      );

      // const res = await adminApiFetch(`/api/users/list?${params.toString()}`, {
      //   method: 'GET',
      // });
      // const json = await res.json();
      // if (!res.ok)
      //   throw new Error(json?.message || 'Не удалось получить список');

      setData(data);
    } catch (e: any) {
      setError(String(e.message || e));
    }
  }

  // useEffect(() => {
  //   load(); /* eslint-disable-next-line */
  // }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Пользователи</h2>
        <Link className="underline" href="/admin/users/new">
          Создать
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="rounded-xl border p-2 w-full max-w-sm"
          placeholder="Поиск по email/имени/телефону"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="rounded-xl border px-4"
          // onClick={() => load(0, 20, q)}
        >
          Найти
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-6 space-y-2">
        {data?.items?.length ? (
          data.items.map((u) => (
            <div key={u.id} className="rounded-xl border p-4">
              <div className="font-medium">{u.email}</div>
              <div className="text-sm text-gray-500">
                <span>{u.name || '—'}</span>
                <span>{u.phone || '—'}</span>
                <span>{u.role}</span>
                <Link className="underline" href={`/admin/users/${u.id}`}>
                  Открыть
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Нет пользователей</p>
        )}
      </div>
    </div>
  );
}
