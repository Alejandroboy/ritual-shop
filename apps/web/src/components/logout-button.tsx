'use client';
import { useState } from 'react';

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // игнорируем сетевую ошибку — всё равно очищаем клиентское состояние редиректом
    } finally {
      setPending(false);
      window.location.href = '/login';
    }
  }

  return (
    <button
      onClick={onLogout}
      disabled={pending}
      className="rounded-xl border px-4 py-2 text-sm shadow disabled:opacity-60"
      aria-busy={pending}
    >
      {pending ? 'Выходим…' : 'Выйти'}
    </button>
  );
}
