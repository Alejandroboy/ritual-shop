import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Ritual Shop',
  description: 'Каталог и заказы',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Ritual Shop
            </Link>
            <nav className="text-sm flex gap-4">
              <Link href="/catalog">Каталог</Link>
              <Link href="/account">Личный кабинет</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
