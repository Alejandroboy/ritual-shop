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
  const [syncResult, setSyncResult] = useState<null | {
    total: number;
    ok: number;
    failed: number;
    results: Array<{
      templateId: number;
      ok: boolean;
      updated?: number;
      perHoleUpdated?: boolean;
      error?: string;
      errorDetails?: {
        message?: unknown;
        errors?: unknown;
        statusCode?: unknown;
      };
    }>;
  }>(null);

  async function syncAllTemplates() {
    if (!confirm('Синхронизировать цены всех шаблонов из МойСклада?')) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await api<{
        total: number;
        ok: number;
        failed: number;
        results: Array<{
          templateId: number;
          ok: boolean;
          updated?: number;
          perHoleUpdated?: boolean;
          error?: string;
          errorDetails?: {
            message?: unknown;
            errors?: unknown;
            statusCode?: unknown;
          };
        }>;
      }>('/api/moy-sklad/sync-templates-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopOnError: false,
          templateConcurrency: 6,
        }),
      });

      setSyncResult(res);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка синхронизации');
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
      {syncResult && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">
              Результат синхронизации
            </h2>
            <div className="text-sm space-y-1">
              <div>Всего шаблонов: {syncResult.total}</div>
              <div>Успешно: {syncResult.ok}</div>
              <div>Ошибок: {syncResult.failed}</div>
            </div>
          </div>

          {syncResult.failed > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <h3 className="text-base font-semibold text-red-700 mb-3">
                Шаблоны с ошибками
              </h3>

              <div className="space-y-3">
                {syncResult.results
                  .filter((item) => !item.ok)
                  .map((item) => {
                    const message = item.errorDetails?.message;
                    const nestedErrors = item.errorDetails?.errors;

                    return (
                      <div
                        key={item.templateId}
                        className="rounded-xl border border-red-200 bg-white p-3"
                      >
                        <div className="font-medium">
                          Template ID: {item.templateId}
                        </div>

                        {item.error && (
                          <div className="text-sm text-red-700 mt-1">
                            Ошибка: {item.error}
                          </div>
                        )}

                        {typeof message === 'string' && message.trim() && (
                          <div className="text-sm text-neutral-700 mt-1">
                            Сообщение: {message}
                          </div>
                        )}

                        {Array.isArray(message) && message.length > 0 && (
                          <div className="text-sm text-neutral-700 mt-1">
                            Сообщение: {message.join(', ')}
                          </div>
                        )}

                        {Array.isArray(nestedErrors) &&
                          nestedErrors.length > 0 && (
                            <ul className="mt-2 text-sm text-neutral-700 list-disc pl-5 space-y-1">
                              {nestedErrors.map((err, idx) => (
                                <li key={idx}>{String(err)}</li>
                              ))}
                            </ul>
                          )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
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
