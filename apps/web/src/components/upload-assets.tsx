'use client';
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../state/app-store';
import { shallow } from 'zustand/shallow';

type Props = { orderId: string | null; itemId: string | null };

export function UploadAsset({ orderId, itemId }: Props) {
  const enqueueFiles = useAppStore((s) => s.enqueueFiles);
  const ensureOrder = useAppStore((s) => s.ensureOrder);
  const queue = useAppStore((s) => s.queue);
  const jobs = useMemo(
    () =>
      queue.filter(
        (j) =>
          (!orderId || j.orderId === orderId) &&
          (itemId ? j.itemId === itemId : true),
      ),
    [queue, orderId, itemId],
  );
  const [error, setError] = useState<string | null>(null);

  const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
  const MAX_FILES = 8;
  const MAX_SIZE = 15 * 1024 * 1024;

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);

    const invalid = arr.find(
      (f) => !ACCEPTED.includes(f.type) || f.size > MAX_SIZE,
    );
    if (invalid) {
      setError(
        `Разрешены PNG/JPEG/WEBP/PDF до 15MB. Файл "${invalid.name}" не подходит.`,
      );
      e.target.value = '';
      return;
    }
    setError(null);

    const ensuredOrderId = orderId ?? (await ensureOrder());

    enqueueFiles(ensuredOrderId, itemId || null, arr.slice(0, MAX_FILES));
    e.target.value = '';
  }

  const hasStaged = useMemo(
    () => jobs.some((j) => j.state === 'uploaded' && !j.itemId),
    [jobs],
  );

  return (
    <div className="border rounded p-3 space-y-2">
      <div className="text-sm text-neutral-700">Загрузите файлы</div>
      <input
        className="cursor-pointer"
        type="file"
        multiple
        onChange={onSelect}
      />
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!!jobs.length && (
        <div className="space-y-1 text-sm">
          {jobs.map((j) => (
            <div key={j.id}>
              {j.file.name} — {j.state}
              {j.state === 'uploaded' && !j.itemId}
              {j.error ? ` (${j.error})` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadAsset;
