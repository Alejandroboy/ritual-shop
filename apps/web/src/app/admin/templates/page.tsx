'use client';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Template } from '@types';
import { adminApiFetch, api } from '@utils';
import { useState } from 'react';

export default function TemplatesPage() {
  const { data, error } = useSWR('/api/admin/templates', (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  const [syncing, setSyncing] = useState(false);

  async function syncAllTemplates() {
    if (!confirm('Синхронизировать цены всех шаблонов из МойСклада?')) return;

    setSyncing(true);

    try {
      const res = await api<{
        total: number;
        ok: number;
        failed: number;
      }>('/api/moy-sklad/sync-templates-prices', {
        method: 'POST',
      });

      alert(
        `Синхронизация завершена\n\n` +
          `Всего шаблонов: ${res.total}\n` +
          `Успешно: ${res.ok}\n` +
          `Ошибок: ${res.failed}`,
      );
    } catch (e) {
      alert('Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  }
  if (error) return <div className="text-red-600">Ошибка: {String(error)}</div>;
  if (!data) return <div>Загрузка…</div>;
  const items = data.items ?? [];
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Шаблоны</h1>
        <button
          onClick={syncAllTemplates}
          disabled={syncing}
          className="px-4 py-2 rounded-xl bg-black text-white flex items-center gap-2"
        >
          {syncing ? 'Синхронизация...' : 'Синхронизировать цены (МойСклад)'}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((t: Template) => (
          <Link
            key={t.id}
            href={`/admin/templates/${t.id}`}
            className="block border rounded-xl p-3 hover:bg-gray-50"
          >
            <div className="font-mono">{t.code}</div>
            <div className="text-sm text-gray-600">{t.label}</div>
            <div className="text-sm text-gray-600">{t.fullTitle}</div>
            {t.previewPath && (
              <Image
                src={t.previewPath}
                alt=""
                className="h-16 mt-2 object-contain"
              />
            )}
          </Link>
        ))}
        {items.length === 0 && (
          <div className="text-gray-500">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
