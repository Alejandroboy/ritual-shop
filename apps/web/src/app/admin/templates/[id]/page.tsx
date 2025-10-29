'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { Refs, Template } from '@types';

// ---------- utils ----------
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    ...(init || {}),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(t || r.statusText);
  return t ? (JSON.parse(t) as T) : (null as unknown as T);
}

type Size = Refs['sizes'][number];
type AllowedSize = NonNullable<Template['allowedSizes']>[number];

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function hasPreview(t: Template): t is Template & { previewPath: string } {
  const p = (t as unknown as { previewPath?: unknown }).previewPath;
  return typeof p === 'string' && p.length > 0;
}

// ---------- component ----------
export default function TemplateEdit() {
  const { id } = useParams<{ id: string }>();

  // ---------- state ----------
  const [refs, setRefs] = useState<Refs>({
    sizes: [],
    frames: [],
    backgrounds: [],
    finishes: [],
    holePatterns: [],
  });
  const [tpl, setTpl] = useState<Template | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');

  const [perHolePrice, setPerHolePrice] = useState<number>(0);

  const [sizePrices, setSizePrices] = useState<Record<number, number>>({});

  const sizeById = useMemo(() => {
    const m = new Map<number, Size>();
    for (const s of refs.sizes) m.set(s.id, s);
    return m;
  }, [refs.sizes]);

  // ---------- data load ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [fetchedRefs, fetchedTpl] = await Promise.all([
          api<Refs>('/api/admin/templates/refs'),
          api<Template>(`/api/admin/templates/${id}`),
        ]);
        if (cancelled) return;

        setRefs(fetchedRefs);
        setTpl(fetchedTpl);

        setCode(fetchedTpl?.code ?? '');
        setLabel(fetchedTpl?.label ?? '');
        setPerHolePrice(Number(fetchedTpl?.perHolePrice ?? 0));

        const prices: Record<number, number> = {};
        for (const row of fetchedTpl?.allowedSizes ?? []) {
          prices[Number(row.sizeId)] = Number(row.price ?? 0);
        }
        setSizePrices(prices);
      } catch (e: unknown) {
        setErr(errMessage(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ---------- actions ----------
  async function saveAll(e?: React.FormEvent) {
    e?.preventDefault();
    if (!tpl) return;
    setSaving(true);
    try {
      const dto: {
        code: string;
        label: string;
        perHolePrice: number;
        sizePrices: Record<number, number>;
      } = {
        code,
        label,
        perHolePrice: Number.isFinite(perHolePrice) ? perHolePrice : 0,
        sizePrices: Object.fromEntries(
          Object.entries(sizePrices)
            .filter(
              ([, v]) => Number.isFinite(v as number) && (v as number) >= 0,
            )
            .map(([k, v]) => [Number(k), Number(v)]),
        ),
      };

      await api<void>(`/api/admin/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      const fresh = await api<Template>(`/api/admin/templates/${id}`);
      setTpl(fresh);
      setCode(fresh?.code ?? '');
      setLabel(fresh?.label ?? '');
      setPerHolePrice(Number(fresh?.perHolePrice ?? 0));

      const freshPrices: Record<number, number> = {};
      for (const row of fresh?.allowedSizes ?? []) {
        freshPrices[Number(row.sizeId)] = Number(row.price ?? 0);
      }
      setSizePrices(freshPrices);

      alert('Сохранено');
    } catch (e: unknown) {
      alert(`Ошибка сохранения: ${errMessage(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPreview(f: File) {
    try {
      const fd = new FormData();
      fd.append('file', f);
      await fetch(`/api/admin/templates/${id}/preview`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const fresh = await api<Template>(`/api/admin/templates/${id}`);
      setTpl(fresh);
    } catch (e: unknown) {
      alert(`Ошибка загрузки превью: ${errMessage(e)}`);
    }
  }

  async function remove() {
    if (!confirm('Удалить шаблон?')) return;
    setDeleting(true);
    try {
      await api<void>(`/api/admin/templates/${id}`, { method: 'DELETE' });
      location.href = '/admin/templates';
    } catch (e: unknown) {
      alert(`Ошибка удаления: ${errMessage(e)}`);
    } finally {
      setDeleting(false);
    }
  }

  // ---------- render ----------
  if (err) return <div className="text-red-600">{err}</div>;
  if (loading || !tpl) return <div>Загрузка…</div>;

  const rows: AllowedSize[] = (tpl.allowedSizes ?? []) as AllowedSize[];

  return (
    <form onSubmit={saveAll} className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Шаблон {tpl.label}</h1>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Код
          <input
            className="border rounded p-2 w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Название
          <input
            className="border rounded p-2 w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-2 border rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-lg">Цены</h2>

        {(tpl.material === 'WHITE_CERAMIC_GRANITE' ||
          tpl.material === 'BLACK_CERAMIC_GRANITE') && (
          <div>
            <div className="text-sm text-neutral-600 mb-1">
              Материал шаблона: <b>{tpl.material}</b>
            </div>
            <label className="text-sm">
              Цена за отверстие
              <input
                type="number"
                className="border rounded p-2 w-48 ml-2"
                value={perHolePrice}
                onChange={(e) => setPerHolePrice(Number(e.target.value || 0))}
                min={0}
              />
            </label>
          </div>
        )}

        <div>
          <h3 className="font-medium">Цены по размерам</h3>
          <p className="text-xs text-neutral-500 mb-2">
            Видны только разрешённые размеры этого шаблона.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {rows.map((row) => {
              const sizeId = Number(row.sizeId);
              const s = sizeById.get(sizeId);
              const value = Number(sizePrices[sizeId] ?? 0);
              return (
                <label key={sizeId} className="text-sm flex items-center gap-2">
                  <span
                    className="w-32 truncate"
                    title={s?.label ?? `Размер #${sizeId}`}
                  >
                    {s?.label ?? `ID: ${sizeId}`}
                  </span>
                  <input
                    type="number"
                    className="border rounded p-2 w-36"
                    value={value}
                    min={0}
                    onChange={(e) => {
                      const v = Number(e.target.value || 0);
                      setSizePrices((prev) => ({ ...prev, [sizeId]: v }));
                    }}
                  />
                </label>
              );
            })}
            {rows.length === 0 && (
              <div className="text-sm text-neutral-500">
                Для этого шаблона пока не выбраны разрешённые размеры.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {hasPreview(tpl) && (
          <Image
            src={tpl.previewPath}
            alt=""
            width={160}
            height={96}
            className="h-24 w-auto object-contain"
          />
        )}
        <input
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            e.target.files?.[0] && uploadPreview(e.target.files[0])
          }
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="px-4 py-2 rounded-xl border disabled:opacity-60"
        >
          {deleting ? 'Удаление…' : 'Удалить'}
        </button>
      </div>
    </form>
  );
}
