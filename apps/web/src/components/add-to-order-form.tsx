'use client';
import React, { useMemo, useState } from 'react';
import type { Finish, TemplateDetails } from '@utils';
import { UploadAsset } from './upload-assets'; // если default export — замени на: import UploadAsset from './upload-assets'
import { useAppStore } from '../state/app-store';

type Props = { tpl: TemplateDetails };

export default function AddToOrderForm({ tpl }: Props) {
  const attachPendingToItem = useAppStore((s) => s.attachPendingToItem);
  const draftOrderId = useAppStore((s) => s.draftOrderId);
  console.log('draftOrderId', draftOrderId);
  const ensureOrder = useAppStore((s) => s.ensureOrder);
  const addItem = useAppStore((s) => s.addItem);

  const [itemId, setItemId] = useState<string | null>(null);

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

  const needFinish =
    tpl.requiresFinish ||
    tpl.variants.some((v) => v.holePattern === holePattern && v.finishRequired);

  const finishOptions = useMemo(() => {
    const byVariant = tpl.variants.find((v) => v.holePattern === holePattern);
    return byVariant?.finishes?.map((f) => f.code as Finish) ?? [];
  }, [holePattern, tpl.variants]);

  async function submit() {
    const orderId = await ensureOrder();
    const payload = {
      templateCode: tpl.code,
      sizeId: sizeId || undefined,
      holePattern: holePattern || undefined,
      frameId: frameId || undefined,
      backgroundId: backgroundId || undefined,
      finish: finish || undefined,
      comment: comment || undefined,
    };
    try {
      const item = await addItem(payload); // { id, orderId }
      setItemId(item.id);
      attachPendingToItem(orderId, item.id);
      alert('Позиция добавлена в заказ');
    } catch (e) {
      alert('Ошибка добавления заказа');
      console.log('Ошибка добавления заказа', e);
    }
  }

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

      <div className="pt-2">
        <UploadAsset orderId={draftOrderId} itemId={itemId} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={submit}
          className="px-4 py-2 rounded-md bg-neutral-900 text-white"
        >
          Добавить в заказ
        </button>
        {draftOrderId && (
          <a href="/checkout" className="px-4 py-2 rounded-md border">
            Перейти в заказ
          </a>
        )}
      </div>
    </div>
  );
}
