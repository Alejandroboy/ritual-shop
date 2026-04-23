'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch, labelOf, roleLabels } from '@utils';
import { useAppStore } from '@state';

type Role = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

const roleLabel = labelOf<Role>(roleLabels);

export default function CreateUserForm() {
  const router = useRouter();
  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    legalName: '',
    address: '',
    inn: '',
    phone: '',
    delivery: '',
    role: 'CUSTOMER' as Role,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [type, setType] = useState('password');

  useEffect(() => {
    if (!me) fetchMe().catch(() => {});
  }, [me, fetchMe]);

  function handleToggleType() {
    if (type === 'password') {
      setType('text');
    } else {
      setType('password');
    }
  }

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
          legalName: form.legalName.trim() || null,
          address: form.address.trim() || null,
          inn: form.inn.trim() || null,
          delivery: form.delivery || null,
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
        legalName: '',
        address: '',
        inn: '',
        delivery: '',
        role: 'CUSTOMER',
      });
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
            id="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
          />
        </label>

        <label className="block relative">
          <span className="text-sm font-medium">Пароль</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type={type}
            required
            minLength={6}
            value={form.password}
            id="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="минимум 6 символов"
          />
          <div
            onClick={handleToggleType}
            className="absolute top-[40px] right-[5px] cursor-pointer"
          >
            {type === 'password' ? 'Показать' : 'Скрыть'}
          </div>
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
        <label className="block">
          <span className="text-sm font-medium">Организация</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="text"
            value={form.legalName}
            onChange={(e) => setForm({ ...form, legalName: e.target.value })}
            placeholder="ООО ..."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Адрес</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="г. Москва..."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">ИНН</span>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            type="text"
            value={form.inn}
            onChange={(e) => setForm({ ...form, inn: e.target.value })}
            placeholder="8457..."
          />
        </label>
        {me && me.role !== 'ADMIN' && me.role !== 'ADMIN_GOD' ? (
          ' '
        ) : (
          <label className="block">
            <span className="text-sm font-medium">Роль</span>
            <select
              className="mt-1 w-full rounded-xl border p-3 outline-none bg-white"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as Role })
              }
            >
              <option value="CUSTOMER">{roleLabel('CUSTOMER')}</option>
              <option value="MANAGER">{roleLabel('MANAGER')}</option>
              <option value="ADMIN">{roleLabel('ADMIN')}</option>
            </select>
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium">Доставка</span>
          <textarea
            className="mt-1 w-full rounded-xl border p-3 outline-none"
            rows={3}
            value={form.delivery}
            onChange={(e) => setForm({ ...form, delivery: e.target.value })}
            placeholder="Самовывоз//Курьер//Транспортная Компания"
          />
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
