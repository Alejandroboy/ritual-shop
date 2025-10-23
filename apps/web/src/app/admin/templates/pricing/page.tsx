'use client';
import React, { ChangeEvent, useState } from 'react';
import { adminApiFetch, api } from '@utils';

export default function PricingTools() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function applyBulk(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const form = new FormData();
    const payload = { filter: {}, set: {} };
    // if (form.get('material')) payload.filter.material = form.get('material');
    // if (form.get('shape')) payload.filter.shape = form.get('shape');
    // if (form.get('q')) payload.filter.q = form.get('q');
    // if (form.get('base')) payload.set.basePriceMinor = Number(form.get('base'));
    // // пример: size extra
    // if (form.get('sizeId') && form.get('sizeExtra')) {
    //   payload.sizeExtra = {
    //     sizeId: Number(form.get('sizeId')),
    //     extraPriceMinor: Number(form.get('sizeExtra')),
    //     mode: form.get('mode') || 'set',
    //   };
    // }
    try {
      const res = await api('/api/admin/templates/pricing/bulk', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setMsg(`OK: affected`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      setMsg(`Ошибка: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCSV(e: ChangeEvent) {
    if (!e.target) return;
    const file = ((e.target as HTMLInputElement).files &&
      (e.target as HTMLInputElement).files?.[0]) as File | undefined;
    if (!file) return;
    setBusy(true);
    setMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await adminApiFetch('/api/admin/templates/pricing/import', {
        method: 'POST',
        body: fd,
      });
      setMsg(`Импорт выполнен, апдейтов:`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      setMsg(`Ошибка импорта: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Массовое ценообразование</h1>

      <form onSubmit={applyBulk} className="grid gap-3 max-w-2xl">
        <div className="font-medium">Фильтр</div>
        <input
          name="q"
          placeholder="Поиск (code/label)"
          className="border rounded p-2"
        />
        <div className="grid grid-cols-2 gap-3">
          <select name="material" className="border rounded p-2">
            <option value="">Material</option>
            <option>WHITE_CERAMIC_GRANITE</option>
            <option>BLACK_CERAMIC_GRANITE</option>
            <option>GLASS</option>
            <option>CERMET</option>
            <option>GROWTH_PHOTOCERAMICS</option>
            <option>ENGRAVING</option>
          </select>
          <select name="shape" className="border rounded p-2">
            <option value="">Shape</option>
            <option>RECTANGLE</option>
            <option>OVAL</option>
            <option>ARCH</option>
            <option>STAR</option>
            <option>HEART</option>
          </select>
        </div>

        <div className="font-medium mt-2">Действие</div>
        <label className="text-sm">
          Базовая цена (minor)
          <input
            name="base"
            type="number"
            className="border rounded p-2 w-48 ml-2"
          />
        </label>

        <div className="grid grid-cols-3 gap-3 items-end">
          <label>
            Size ID{' '}
            <input
              name="sizeId"
              type="number"
              className="border rounded p-2 w-24 ml-2"
            />
          </label>
          <label>
            Надбавка (minor){' '}
            <input
              name="sizeExtra"
              type="number"
              className="border rounded p-2 w-28 ml-2"
            />
          </label>
          <label>
            Режим
            <select name="mode" className="border rounded p-2 ml-2">
              <option value="set">set</option>
              <option value="inc">inc</option>
            </select>
          </label>
        </div>

        <button
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-black text-white w-fit"
        >
          {busy ? '…' : 'Применить'}
        </button>
      </form>

      <div>
        <div className="font-medium">Импорт CSV</div>
        <input
          type="file"
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
          onChange={uploadCSV}
        />
        <p className="text-sm text-gray-600 mt-2">
          Формат:{' '}
          <code>
            code,basePriceMinor,size:1,frame:3,background:10,finish:MATTE,hole:NONE
          </code>
        </p>
      </div>

      {msg && <div className="p-2 rounded bg-gray-50">{msg}</div>}
    </div>
  );
}
