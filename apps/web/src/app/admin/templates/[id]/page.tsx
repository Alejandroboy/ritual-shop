'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export default function TemplateEdit() {
  const { id } = useParams<{ id: string }>();
  const [refs, setRefs] = useState<any>({});
  const [tpl, setTpl] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    api('/api/admin/templates/refs').then(setRefs);
  }, []);
  useEffect(() => {
    api(`/api/admin/templates/${id}`)
      .then(setTpl)
      .catch((e) => setErr(String(e)));
  }, [id]);

  async function save(e: any) {
    e.preventDefault();
    const { id: _, ...dto } = tpl;
    await api(`/api/admin/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    alert('Сохранено');
  }
  async function uploadPreview(f: File) {
    const fd = new FormData();
    fd.append('file', f);
    await fetch(`/api/admin/templates/${id}/preview`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    const fresh = await api(`/api/admin/templates/${id}`);
    setTpl(fresh);
  }
  async function remove() {
    if (!confirm('Удалить шаблон?')) return;
    await api(`/api/admin/templates/${id}`, { method: 'DELETE' });
    location.href = '/admin/templates';
  }

  async function patchAllowed(payload: any) {
    await api(`/api/admin/templates/${id}/allowed`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const fresh = await api(`/api/admin/templates/${id}`);
    setTpl(fresh);
  }

  if (err) return <div className="text-red-600">{err}</div>;
  if (!tpl) return <div>Загрузка…</div>;

  const {
    sizes = [],
    frames = [],
    backgrounds = [],
    finishes = [],
    holePatterns = [],
  } = refs;
  const ch = (k: string, v: any) => setTpl((s: any) => ({ ...s, [k]: v }));

  const renderFinishes = () => {
    if (tpl.allowedFinishes.length)
      return (
        <select
          className="border rounded p-2"
          value={tpl.finishes || ''}
          onChange={(e) => ch('finishId', e.target.value)}
        >
          <option value="">Финиш</option>
          {finishes.map((x: any) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      );
  };

  const renderHoles = () => {
    if (tpl.allowedHoles.length)
      return (
        <select
          className="border rounded p-2"
          value={tpl.holePattern || ''}
          onChange={(e) => ch('holeId', e.target.value)}
        >
          <option value="">Отверстия</option>
          {holePatterns.map((x: any) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      );
  };

  const sizeExtraMap: Record<number, number> = Object.fromEntries(
    (tpl.allowedSizes ?? []).map((x: any) => [
      x.sizeId,
      x.extraPriceMinor ?? 0,
    ]),
  );
  const frameExtraMap: Record<number, number> = Object.fromEntries(
    (tpl.allowedFrames ?? []).map((x: any) => [
      x.frameId,
      x.extraPriceMinor ?? 0,
    ]),
  );
  const bgExtraMap: Record<number, number> = Object.fromEntries(
    (tpl.allowedBackgrounds ?? []).map((x: any) => [
      x.backgroundId,
      x.extraPriceMinor ?? 0,
    ]),
  );
  const finishExtraMap: Record<string, number> = Object.fromEntries(
    (tpl.allowedFinishes ?? []).map((x: any) => [
      x.finish,
      x.extraPriceMinor ?? 0,
    ]),
  );
  const holeExtraMap: Record<string, number> = Object.fromEntries(
    (tpl.allowedHoles ?? []).map((x: any) => [
      x.pattern,
      x.extraPriceMinor ?? 0,
    ]),
  );

  return (
    <form onSubmit={save} className="space-y-3 max-w-2xl">
      <h1 className="text-2xl font-semibold">Шаблон {tpl.label}</h1>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Код
          <input
            className="border rounded p-2 w-full"
            value={tpl.code || ''}
            onChange={(e) => ch('code', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Название
          <input
            className="border rounded p-2 w-full"
            value={tpl.title || ''}
            onChange={(e) => ch('title', e.target.value)}
          />
        </label>
        <select
          className="border rounded p-2"
          value={tpl.sizeId || ''}
          onChange={(e) => ch('sizeId', e.target.value)}
        >
          <option value="">Размер</option>
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={tpl.frameId || ''}
          onChange={(e) => ch('frameId', e.target.value)}
        >
          <option value="">Рамка</option>
          {frames.map((x: any) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={tpl.backgroundId || ''}
          onChange={(e) => ch('backgroundId', e.target.value)}
        >
          <option value="">Фон</option>
          {backgrounds.map((x: any) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        {renderFinishes()}
        {renderHoles()}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!tpl.isActive}
          onChange={(e) => ch('isActive', e.target.checked)}
        />{' '}
        Активен
      </label>
      <div className="mt-4 border rounded-2xl p-4">
        <h2 className="font-semibold text-lg mb-3">Цены</h2>

        <div className="mb-4">
          <label className="text-sm">
            Базовая цена (minor)
            <input
              type="number"
              className="border rounded p-2 w-48 ml-2"
              value={tpl.basePriceMinor ?? 0}
              onChange={(e) =>
                ch('basePriceMinor', Number(e.target.value || 0))
              }
              onBlur={async (e) => {
                const val = Number(e.currentTarget.value || 0);
                await patchAllowed({ basePriceMinor: val });
              }}
            />
          </label>
        </div>

        <div className="mt-2">
          <h3 className="font-medium">Надбавки по размерам</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {sizes.map((s: any) => (
              <label key={s.id} className="text-sm flex items-center gap-2">
                <span className="w-28">{s.label}</span>
                <input
                  type="number"
                  className="border rounded p-2 w-32"
                  defaultValue={sizeExtraMap[s.id] ?? 0}
                  onBlur={async (e) => {
                    const val = Number(e.currentTarget.value || 0);
                    await patchAllowed({ sizeExtras: { [s.id]: val } });
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Надбавки по рамкам</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {frames.map((f: any) => (
              <label key={f.id} className="text-sm flex items-center gap-2">
                <span className="w-28">
                  #{f.code} {f.name}
                </span>
                <input
                  type="number"
                  className="border rounded p-2 w-32"
                  defaultValue={frameExtraMap[f.id] ?? 0}
                  onBlur={async (e) => {
                    const val = Number(e.currentTarget.value || 0);
                    await patchAllowed({ frameExtras: { [f.id]: val } });
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Надбавки по фонам</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {backgrounds.map((b: any) => (
              <label key={b.id} className="text-sm flex items-center gap-2">
                <span className="w-28">
                  #{b.code} {b.name}
                </span>
                <input
                  type="number"
                  className="border rounded p-2 w-32"
                  defaultValue={bgExtraMap[b.id] ?? 0}
                  onBlur={async (e) => {
                    const val = Number(e.currentTarget.value || 0);
                    await patchAllowed({ backgroundExtras: { [b.id]: val } });
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Надбавки по финишам</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {finishes.map((f: string) => (
              <label key={f} className="text-sm flex items-center gap-2">
                <span className="w-28">{f}</span>
                <input
                  type="number"
                  className="border rounded p-2 w-32"
                  defaultValue={finishExtraMap[f] ?? 0}
                  onBlur={async (e) => {
                    const val = Number(e.currentTarget.value || 0);
                    await patchAllowed({ finishExtras: { [f]: val } });
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Надбавки по отверстиям</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {holePatterns.map((p: string) => (
              <label key={p} className="text-sm flex items-center gap-2">
                <span className="w-28">{p}</span>
                <input
                  type="number"
                  className="border rounded p-2 w-32"
                  defaultValue={holeExtraMap[p] ?? 0}
                  onBlur={async (e) => {
                    const val = Number(e.currentTarget.value || 0);
                    await patchAllowed({ holeExtras: { [p]: val } });
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {tpl.previewPath && (
          <img src={tpl.previewPath} alt="" className="h-24 object-contain" />
        )}
        <input
          type="file"
          onChange={(e) =>
            e.target.files?.[0] && uploadPreview(e.target.files[0])
          }
        />
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-xl bg-black text-white">
          Сохранить
        </button>
        <button
          type="button"
          onClick={remove}
          className="px-4 py-2 rounded-xl border"
        >
          Удалить
        </button>
      </div>
    </form>
  );
}
