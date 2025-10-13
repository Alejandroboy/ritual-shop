'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { Finish, TemplateDetails } from '../../api';
import { api, makeUrl } from '../../api';

type Props = { tpl: TemplateDetails };
type Order = {
  id: string;
};
type FilesByItem = Record<string, File[]>;
type ProgressByItem = Record<string, number>;
type ErrorsByItem = Record<string, string | null>;

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_FILES = 8;
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export default function AddToOrderForm({ tpl }: Props) {
  // хранить черновой orderId в localStorage
  const [orderId, setOrderId] = useState<string | null>(null);
  const [filesByItem, setFilesByItem] = useState<FilesByItem>({});
  const [errorsByItem, setErrorsByItem] = useState<ErrorsByItem>({});
  const [itemId, setItemId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.localStorage.getItem('draftOrderId');
    if (id) setOrderId(id);
  }, []);

  const [sizeId, setSizeId] = useState<number | ''>(tpl.defaults.sizeId ?? '');
  const [holePattern, setHolePattern] = useState<string | ''>(
    tpl.defaults.holePattern ?? '',
  );
  const [frameId, setFrameId] = useState<number | ''>(
    tpl.defaults.frameId ?? '',
  );
  const [backgroundId, setBackgroundId] = useState<number | ''>(
    tpl.defaults.backgroundId ?? '',
  );
  const [finish, setFinish] = useState<string | ''>('');
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const needFinish =
    tpl.requiresFinish ||
    tpl.variants.some((v) => v.holePattern === holePattern && v.finishRequired);
  const finishOptions = useMemo(() => {
    const byVariant = tpl.variants.find((v) => v.holePattern === holePattern);
    return byVariant?.finishes?.map((f) => f.code as Finish) ?? [];
  }, [holePattern, tpl.variants]);

  async function ensureOrder(): Promise<string> {
    if (orderId) return orderId;
    const url = `/orders`;
    const data = await api<Order>(url, { method: 'POST' });

    window.localStorage.setItem('draftOrderId', data.id);
    setOrderId(data.id);
    return data.id;
  }

  function onFilesChange(itemId: string | null, list: FileList | null) {
    if (!list) return;
    const files = Array.from(list);

    // валидации
    const invalid = files.find(
      (f) => !ACCEPTED.includes(f.type) || f.size > MAX_SIZE,
    );
    if (invalid) {
      setErrorsByItem((p) => ({
        ...p,
        [itemId]: `Разрешены PNG/JPEG/WEBP/PDF до 15MB. Файл "${invalid.name}" не подходит.`,
      }));
      return;
    }

    setErrorsByItem((p) => ({ ...p, [itemId]: null }));
    setFilesByItem((prev) => {
      const prevArr = prev[itemId] ?? [];
      const nextArr = [...prevArr, ...files].slice(0, MAX_FILES);
      return { ...prev, [itemId]: nextArr };
    });
  }

  // удалить один файл до аплоада
  function removeFile(itemId: string | null, i: number) {
    setFilesByItem((prev) => {
      const arr = [...(prev[itemId] ?? [])];
      arr.splice(i, 1);
      return { ...prev, [itemId]: arr };
    });
  }

  async function uploadItemFiles(
    itemId: string | null,
    files: File[],
    orderId: string | null,
  ) {
    console.log(itemId, files, orderId);
    if (!files || !files.length || !itemId) return;

    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));

    try {
      const data = await api<Order>(
        `/order-items/${orderId}/items/${itemId}/assets`,
        {
          method: 'POST',
          body: fd,
        },
      );
      console.log('order-items', data);
    } catch (e) {
      alert('Ошибка добавления файла');
      console.log('Ошибка добавления файла', e);
    }
  }

  async function submit() {
    const id = await ensureOrder();
    const payload = {
      templateCode: tpl.code,
      sizeId: sizeId || undefined,
      holePattern: holePattern || undefined,
      frameId: frameId || undefined,
      backgroundId: backgroundId || undefined,
      finish: finish || undefined,
      comment: comment || undefined,
    };
    const url = `/orders/${id}/items`;
    try {
      const data = await api<Order>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setItemId(data.id);
      const files = filesByItem[orderId] ?? [];
      await uploadItemFiles(data.id, files, id);
      alert('Файлы добавлены в заказ');
      window.localStorage.setItem('orderId', id);
    } catch (e) {
      alert('Ошибка добавления заказа');
      console.log('Ошибка добавления заказа', e);
    }

    alert('Позиция добавлена в заказ');
  }

  const renderPreview = () => {
    const list = filesByItem[orderId] ?? [];
    const err = errorsByItem[orderId];
    if (err) {
      return (
        <div className="border rounded p-3">
          {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
        </div>
      );
    }
    if (!!list.length) {
      return (
        <div className="border rounded p-3">
          {!!list.length && (
            <div className="mt-3 flex flex-wrap gap-3">
              {list.map((f, i) => {
                const isImg = f.type.startsWith('image/');
                return (
                  <div key={i} className="border rounded p-2">
                    <div className="text-xs mb-1 max-w-[180px] truncate">
                      {f.name}
                    </div>
                    {isImg ? (
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-32 h-32 object-cover rounded"
                        onLoad={(e) =>
                          URL.revokeObjectURL(
                            (e.target as HTMLImageElement).src,
                          )
                        }
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center bg-neutral-100 rounded text-xs">
                        PDF
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(orderId, i)}
                      className="mt-2 text-xs underline"
                    >
                      убрать
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <div className="mb-1 text-neutral-600">Размер</div>
          <select
            className="border rounded-md px-2 py-1 bg-white w-full"
            value={sizeId}
            onChange={(e) =>
              setSizeId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">—</option>
            {tpl.sizes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <div className="mb-1 text-neutral-600">Отверстия</div>
          <select
            className="border rounded-md px-2 py-1 bg-white w-full"
            value={holePattern}
            onChange={(e) => setHolePattern(e.target.value || '')}
          >
            <option value="">—</option>
            {tpl.holes.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>

        {tpl.supportsFrame && (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Рамка</div>
            <select
              className="border rounded-md px-2 py-1 bg-white w-full"
              value={frameId}
              onChange={(e) =>
                setFrameId(e.target.value ? Number(e.target.value) : '')
              }
            >
              <option value="">—</option>
              {tpl.frames.map((f) => (
                <option key={f.id} value={f.id}>
                  Рамка {f.code}
                </option>
              ))}
            </select>
          </label>
        )}

        {tpl.requiresBackground && (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Фон</div>
            <select
              className="border rounded-md px-2 py-1 bg-white w-full"
              value={backgroundId}
              onChange={(e) =>
                setBackgroundId(e.target.value ? Number(e.target.value) : '')
              }
            >
              <option value="">—</option>
              {tpl.backgrounds.map((b) => (
                <option key={b.id} value={b.id}>
                  Фон {b.code}
                </option>
              ))}
            </select>
          </label>
        )}

        {needFinish && (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Финиш</div>
            <select
              className="border rounded-md px-2 py-1 bg-white w-full"
              value={finish}
              onChange={(e) => setFinish(e.target.value || '')}
            >
              <option value="">—</option>
              {finishOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="text-sm block">
        <div className="mb-1 text-neutral-600">Комментарий</div>
        <textarea
          className="border rounded-md px-2 py-1 bg-white w-full"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
      <label className="text-sm block">
        <div className="mb-1 text-neutral-600">
          Файлы (фото/макеты) — до 8 шт.
        </div>
        <div>
          <input
            type="file"
            multiple
            onChange={(e) => onFilesChange(orderId, e.target.files)}
          />
        </div>
        {renderPreview()}
      </label>

      <div className="flex gap-2">
        <button
          onClick={submit}
          className="px-4 py-2 rounded-md bg-neutral-900 text-white"
        >
          Добавить в заказ
        </button>
        {orderId && (
          <a href="/checkout" className="px-4 py-2 rounded-md border">
            Перейти в заказ
          </a>
        )}
      </div>
    </div>
  );
}
