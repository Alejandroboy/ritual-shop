'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@utils';
import { User } from '../../../types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type UserData = {
    user: User;
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const data: UserData = await api('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // важно для httpOnly-куки
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (data?.user) {
        window.localStorage.setItem('userId', data.user.id);
        window.location.href = '/account';
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте ещё раз.');
      console.log(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold">Вход</h1>
        <p className="text-sm text-gray-500 mt-1">
          Введите email и пароль, чтобы продолжить.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Пароль</span>
            <input
              className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl p-3 shadow active:scale-[.99] disabled:opacity-60"
          >
            {pending ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Нет аккаунта?{' '}
          <Link className="underline hover:no-underline" href="/register">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </main>
  );
}
