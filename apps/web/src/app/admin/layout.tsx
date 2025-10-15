'use client';
import { adminApiFetch } from '@utils';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const handleExit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApiFetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) router.push('/admin/login');
    } catch (e: any) {
      console.log('Ошибка выхода', e.message);
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4">
        <div className="font-semibold mb-4">Ritual Admin</div>
        <nav className="space-y-2">
          <a href="/admin">Дашборд</a>
          <br />
          <a href="/admin/orders">Заказы</a>
          <br />
          <a href="/admin/templates">Шаблоны</a>
          <br />
          <a href="/admin/templates/pricing">Смена цен</a>
          <br />
          <a href="/admin/users">Пользователи</a>
          <br />
          <a href="/admin/users/new">Создать пользователя</a>
        </nav>
        <div className="cursor-pointer" onClick={handleExit}>
          Exit
        </div>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
