'use client';
import useSWR from 'swr';

async function api(url: string) {
  const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const t = await r.text();
  if (!r.ok) throw new Error(t || r.statusText);
  return JSON.parse(t);
}

export default function TemplatesPage() {
  const { data, error, mutate } = useSWR('/api/admin/templates', api);
  if (error) return <div className="text-red-600">Ошибка: {String(error)}</div>;
  if (!data) return <div>Загрузка…</div>;
  const items = data.items ?? [];
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Шаблоны</h1>
        <a
          className="px-3 py-2 rounded-xl bg-black text-white"
          href="/admin/templates/new"
        >
          Новый шаблон
        </a>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((t: any) => (
          <a
            key={t.id}
            href={`/admin/templates/${t.id}`}
            className="block border rounded-xl p-3 hover:bg-gray-50"
          >
            <div className="font-mono">{t.code}</div>
            <div className="text-sm text-gray-600">{t.label}</div>
            {t.previewPath && (
              <img
                src={t.previewPath}
                alt=""
                className="h-16 mt-2 object-contain"
              />
            )}
          </a>
        ))}
        {items.length === 0 && (
          <div className="text-gray-500">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
