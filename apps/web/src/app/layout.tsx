'use client';

import './globals.css';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useAppStore } from '@state';
import CookieBanner from '../components/cookie-banner';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);

  useEffect(() => {
    if (!me) fetchMe().catch(() => {});
  }, [me, fetchMe]);

  const renderAdminLink = () => {
    if (
      me &&
      (me.role === 'ADMIN' || me.role === 'ADMIN_GOD' || me.role === 'MANAGER')
    ) {
      return <Link href="/admin">Админка</Link>;
    }
  };

  return (
    <html lang="ru" suppressHydrationWarning={true}>
      <body
        className="min-h-screen bg-neutral-50 text-neutral-900"
        suppressHydrationWarning={true}
      >
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Ritual Shop
            </Link>
            <nav className="text-sm flex gap-4">
              <Link href="/catalog">Каталог</Link>
              <Link href="/account">Личный кабинет</Link>
              {renderAdminLink()}
            </nav>
          </div>
        </header>
        <main className="bg-neutral-50">
          <div className="mx-auto max-w-[1120px] px-4 py-6">{children}</div>
        </main>
        <CookieBanner />
      </body>
    </html>
  );
}
