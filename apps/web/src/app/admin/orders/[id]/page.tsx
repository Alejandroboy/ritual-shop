'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { adminApiFetch } from '@utils';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, mutate } = useSWR(`/api/admin/orders/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  const [busy, setBusy] = useState(false);
  console.log('data', data);

  async function setStatus(status: string) {
    setBusy(true);
    await adminApiFetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    mutate();
  }

  async function upload(itemId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    await adminApiFetch(`/api/orders/${id}/items/${itemId}/assets`, {
      method: 'POST',
      body: form,
    });
    mutate();
  }

  if (!data) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Заказ {data.number}</h1>
      <div className="space-y-0 flex flex-wrap justify-between max-w-500">
        {['принят', 'в работе', 'согласование', 'отправлен', 'готов'].map(
          (s) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => setStatus(s)}
              className="px-3 py-1 border rounded-xl cursor-pointer mb-4 mr-8"
            >
              {s}
            </button>
          ),
        )}
      </div>
      <div>
        <h2 className="font-semibold">Позиции</h2>
        {data.items.map((it: any) => (
          <div key={it.id} className="border rounded-xl p-3 my-2">
            <div className="text-sm">{it.templateCode}</div>
            <ul className="text-sm mt-2">
              {it.assets?.map((a: any) => (
                <li key={a.id}>{a.filename}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
