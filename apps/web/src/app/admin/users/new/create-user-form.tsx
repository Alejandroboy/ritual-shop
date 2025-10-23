'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@utils';

type Role = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

export default function CreateUserForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'CUSTOMER' as Role,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setPending(true);

    try {
      const res = await adminApiFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim() || null,
          phone: form.phone.trim() || null,
          role: form.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data?.message)
          ? data.message.join('; ')
          : data?.message || 'Не удалось создать пользователя';
        throw new Error(msg);
      }

      setOk('Пользователь создан');
      setForm({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'CUSTOMER',
      });
      // по желанию — сразу уходим в список
      // router.push('/admin/users');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Пароль</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="минимум 6 символов"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Имя</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Иван"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Телефон</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+7 ... "
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Роль</span>
          <select
            className="mt-1 w-full rounded-xl border p-3 outline-none bg-white"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl px-4 py-2 shadow border active:scale-[.99] disabled:opacity-50"
        >
          {pending ? 'Создаём…' : 'Создать пользователя'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="text-sm underline"
        >
          К списку пользователей
        </button>
      </div>
    </form>
  );
}
