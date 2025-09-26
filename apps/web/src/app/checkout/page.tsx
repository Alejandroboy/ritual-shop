'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '../../utils/api-base';
import { api } from '../../../api';

type FilesByItem = Record<string, File[]>;
type ProgressByItem = Record<string, number>;
type ErrorsByItem = Record<string, string | null>;

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_FILES = 8;
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

type Order = {
  id: string;
};

type OrderDetails = {
  id: string;
  items: {
    id: string;
    templateLabel: string;
    templateCode: string;
    size: {
      label: string;
    };
  }[];
};
export default function CheckoutPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [filesByItem, setFilesByItem] = useState<FilesByItem>({});
  const [progressByItem, setProgressByItem] = useState<ProgressByItem>({});
  const [errorsByItem, setErrorsByItem] = useState<ErrorsByItem>({});
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    comment: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = getApiBase();

  useEffect(() => {
    try {
      const idStr = window.localStorage.getItem('orderId');
      if (!idStr) {
        router.push('/catalog');
        return;
      }
      setOrderId(idStr);
      getOrderDetails(idStr);
    } catch {
      router.push('/catalog');
    }
  }, [router]);

  const items = useMemo(() => orderDetails?.items ?? [], [orderDetails]);

  function onFilesChange(itemId: string, list: FileList | null) {
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
  function removeFile(itemId: string, i: number) {
    setFilesByItem((prev) => {
      const arr = [...(prev[itemId] ?? [])];
      arr.splice(i, 1);
      return { ...prev, [itemId]: arr };
    });
  }

  // 4) аплоад для одной позиции (с простым прогрессом по кол-ву отправленных байтов)
  async function uploadItemFiles(itemId: string, files: File[]) {
    if (!files.length) return;

    // XHR для прогресса; если прогресс не нужен — можно обычный fetch
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        `${API_BASE}/order-items/${orderDetails?.id}/items/${itemId}/assets`,
      );
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const percent = Math.round((evt.loaded / evt.total) * 100);
        setProgressByItem((p) => ({ ...p, [itemId]: percent }));
      };
      xhr.send(fd);
    });

    // очистим прогресс после завершения
    setProgressByItem((p) => ({ ...p, [itemId]: 100 }));
  }

  async function getOrderDetails(idStr: string) {
    if (idStr) {
      try {
        const data = await api<OrderDetails>(`/orders/${idStr}`);
        setOrderDetails(data);
      } catch (e) {
        console.log('getOrderDetails error', e);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    try {
      const uploads = items.map(async (it) => {
        const files = filesByItem[it.id] ?? [];
        if (!files.length) return;
        await uploadItemFiles(it.id, files);
      });
      await Promise.all(uploads);
      const data = await api<Order>(`/orders/${orderId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      window.localStorage.removeItem('orderId');
      window.localStorage.removeItem('draftOrderId');
      router.push(`/order/${data.id}`);
    } catch (e) {
      alert('Ошибка оформления заказа');
      console.log('e Ошибка оформления заказа', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {orderDetails && (
        <>
          <h1 className="text-2xl font-semibold mb-6">В заказе</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ">
            {orderDetails.items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="rounded-xl border bg-white p-4 flex flex-col gap-2"
                >
                  <p>{item.templateLabel}</p>
                  <p>{item.size.label}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
      <h1 className="text-2xl font-semibold mb-6">Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="ФИО"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Телефон"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email (необязательно)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Город"
          required
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Комментарий"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
        <div>
          <label className="block mb-1">Файлы (фото/макеты) — до 8 шт.</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>

        <div className="mt-6 space-y-4">
          {items.map((it, idx) => {
            const list = filesByItem[it.id] ?? [];
            const err = errorsByItem[it.id];
            const progress = progressByItem[it.id] ?? 0;
            return (
              <div key={it.id} className="border rounded p-3">
                <div className="font-medium mb-2">
                  Позиция #{idx + 1} —{' '}
                  {it.templateLabel ?? it.templateCode ?? it.id}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => onFilesChange(it.id, e.target.files)}
                />
                {err && <p className="text-red-600 text-sm mt-2">{err}</p>}

                {/* предпросмотр */}
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
                            // eslint-disable-next-line @next/next/no-img-element
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
                            onClick={() => removeFile(it.id, i)}
                            className="mt-2 text-xs underline"
                          >
                            убрать
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* прогресс */}
                {progress > 0 && progress < 100 && (
                  <div className="mt-3 h-2 bg-neutral-200 rounded">
                    <div
                      className="h-2 rounded bg-black"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Отправка…' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  );
}
