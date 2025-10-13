'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApiFetch } from '@utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const next = useSearchParams().get('next') || '/admin';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await adminApiFetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) router.push(next);
    } catch (e: any) {
      setErr(e.message || 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-3 border rounded-2xl p-6 shadow"
      >
        <h1 className="text-xl font-semibold">Вход в админку</h1>
        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full rounded-xl py-2 bg-black text-white">
          Войти
        </button>
      </form>
    </div>
  );
}
