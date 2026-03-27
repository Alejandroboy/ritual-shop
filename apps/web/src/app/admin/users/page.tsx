'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { adminApiFetch, api } from '@utils';
import useSWR from 'swr';
import { labelOf, roleLabels } from '@utils';
import { Role } from '@types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: Role;
};

const roleLabel = labelOf<Role>(roleLabels);

function AdminUsersList() {
  const qs = new URLSearchParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const qFromUrl = searchParams.get('q') || '';
  const [query, setQuery] = useState(qFromUrl);
  const [error, setError] = useState<boolean>(false);

  if (qFromUrl) qs.set('q', qFromUrl);

  const key = `/api/admin/users/list${qs.toString() ? `?${qs}` : ''}`;

  const { data, mutate } = useSWR(key, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  async function handleDelete(id: string) {
    try {
      await api(`admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      await mutate();
    } catch (e) {
      setError(true);
      console.log('e', e);
    }
  }

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }

    router.push(`${pathname}?${params.toString()}`);
  }

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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button
          className="rounded-xl border px-4 cursor-pointer"
          onClick={handleSearch}
        >
          Найти
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-6 space-y-2">
        {data?.items?.length ? (
          data.items.map((u: User) => (
            <div key={u.id} className="rounded-xl border p-4 relative">
              <div
                className="absolute top-[10px] right-[10px] cursor-pointer flex items-center"
                onClick={() => handleDelete(u.id)}
              >
                <div>Удалить</div>
                <svg
                  className="w-[20px] h-[20px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="font-medium">{u.email}</div>
              <div className="text-sm text-gray-500">
                <p>{u.name || '—'}</p>
                <p>{u.phone || '—'}</p>
                <p>{roleLabel(u.role)}</p>
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

export default function AdminUsersListPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading ...</div>}>
        <AdminUsersList />
      </Suspense>
    </main>
  );
}
