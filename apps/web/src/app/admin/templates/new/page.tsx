'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Refs } from '../../../../types';

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    ...(init || {}),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(t || r.statusText);
  return t ? JSON.parse(t) : null;
}

export default function NewTemplate() {
  const [refs, setRefs] = useState<Refs>({
    sizes: [],
    frames: [],
    backgrounds: [],
    finishes: [],
    holePatterns: [],
  });
  const [form, setForm] = useState({
    code: '',
    title: '',
    isActive: true,
    frameId: '',
    backgroundId: '',
    finishId: '',
    sizeId: '',
  });

  useEffect(() => {
    api('/api/admin/templates/refs').then(setRefs);
  }, []);

  function ch(k: string, v: string | boolean) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    location.href = '/admin/templates';
  }

  const { sizes = [], frames = [], backgrounds = [], finishes = [] } = refs;
  return (
    <form onSubmit={submit} className="space-y-3 max-w-xl">
      <h1 className="text-2xl font-semibold">Новый шаблон</h1>
      <input
        className="border rounded p-2 w-full"
        placeholder="Код"
        value={form.code}
        onChange={(e) => ch('code', e.target.value)}
      />
      <input
        className="border rounded p-2 w-full"
        placeholder="Название"
        value={form.title}
        onChange={(e) => ch('title', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          className="border rounded p-2"
          value={form.sizeId || ''}
          onChange={(e) => ch('sizeId', e.target.value)}
        >
          <option value="">Размер</option>
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={form.frameId || ''}
          onChange={(e) => ch('frameId', e.target.value)}
        >
          <option value="">Рамка</option>
          {frames.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={form.backgroundId || ''}
          onChange={(e) => ch('backgroundId', e.target.value)}
        >
          <option value="">Фон</option>
          {backgrounds.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={form.finishId || ''}
          onChange={(e) => ch('finishId', e.target.value)}
        >
          <option value="">Финиш</option>
          {finishes.map((s: string) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => ch('isActive', e.target.checked)}
        />
        Активен
      </label>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-xl bg-black text-white">
          Создать
        </button>
        <Link className="px-4 py-2 rounded-xl border" href="/admin/templates">
          Отмена
        </Link>
      </div>
    </form>
  );
}
