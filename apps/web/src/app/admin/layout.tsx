'use client';
import { adminApiFetch } from '@utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { MouseEventHandler } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const handleExit: MouseEventHandler<HTMLDivElement> = async () => {
    try {
      const res = await adminApiFetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) router.push('/admin/login');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      console.log('Ошибка выхода', message);
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4">
        <div className="font-semibold mb-4">Ritual Admin</div>
        <nav className="space-y-2">
          <Link href="/admin">Дашборд</Link>
          <br />
          <Link href="/admin/orders">Заказы</Link>
          <br />
          <Link href="/admin/templates">Шаблоны</Link>
          <br />
          <Link href="/admin/users">Пользователи</Link>
          <br />
          <Link href="/admin/users/new">Создать пользователя</Link>
        </nav>
        <div className="cursor-pointer" onClick={handleExit}>
          Exit
        </div>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
