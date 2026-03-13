'use client';
import React, { useMemo, useState } from 'react';
import { useAppStore } from '@state';

type Mode = 'original' | 'retouch';

type Props = {
  orderId: string | null;
  itemId: string | null;
  mode?: Mode;
  sourceAssetId?: string;
  onDone?: () => void;
  userId?: string;
};

export function UploadAsset({
  orderId,
  itemId,
  mode = 'original',
  sourceAssetId,
  onDone,
  userId,
}: Props) {
  const enqueueFiles = useAppStore((s) => s.enqueueFiles);
  const ensureOrder = useAppStore((s) => s.ensureOrder);
  const queue = useAppStore((s) => s.queue);

  const jobs = useMemo(() => {
    if (!orderId) return [];

    return queue.filter(
      (j) => j.orderId === orderId && (itemId ? j.itemId === itemId : true),
    );
  }, [queue, orderId, itemId]);

  const visibleJobs = useMemo(() => {
    return jobs.filter((j) => j.state !== 'done');
  }, [jobs]);

  const [error, setError] = useState<string | null>(null);

  const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
  const MAX_FILES = 8;
  const MAX_SIZE = 15 * 1024 * 1024;

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;

    const files = Array.from(list).slice(0, MAX_FILES);
    e.target.value = '';

    const invalid = files.find(
      (f) => !ACCEPTED.includes(f.type) || f.size > MAX_SIZE,
    );

    if (invalid) {
      setError(
        `Разрешены PNG/JPEG/WEBP/PDF до 15MB. Файл "${invalid.name}" не подходит.`,
      );
      return;
    }

    if (mode === 'retouch' && !sourceAssetId) {
      setError('Не указан исходный ассет для ретуши');
      return;
    }

    setError(null);

    const ensuredOrderId = orderId ?? (await ensureOrder());

    enqueueFiles(ensuredOrderId, itemId || null, files, {
      mode,
      retouchOf: sourceAssetId,
      userId,
    });

    onDone?.();
  }

  return (
    <div>
      <label
        htmlFor="files"
        className="bg-[#f1f1f1] border rounded-md p-[10px] cursor-pointer inline-block"
      >
        <input
          id="files"
          type="file"
          className="hidden"
          onChange={onSelect}
          multiple
        />
        {mode === 'retouch' ? 'Добавить макет' : 'Прикрепить файлы'}
      </label>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {!!visibleJobs.length && (
        <div className="space-y-1 text-sm mt-[20px]">
          {visibleJobs.map((j) => (
            <div key={j.id}>
              {j.file.name} — {j.state}
              {j.error ? ` (${j.error})` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
