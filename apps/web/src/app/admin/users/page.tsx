'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminApiFetch } from '@utils';
import useSWR from 'swr';

type User = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
};

export default function AdminUsersListPage() {
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data } = useSWR(`/api/admin/users/list`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

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
        <button className="rounded-xl border px-4">Найти</button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-6 space-y-2">
        {data?.items?.length ? (
          data.items.map((u: User) => (
            <div key={u.id} className="rounded-xl border p-4">
              <div className="font-medium">{u.email}</div>
              <div className="text-sm text-gray-500">
                <p>{u.name || '—'}</p>
                <p>{u.phone || '—'}</p>
                <p>{u.role}</p>
              </div>
              <div className="mt-[10px]">
                <button className="rounded-xl border px-4">
                  <Link href={`/admin/users/${u.id}`}>Открыть</Link>
                </button>
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
