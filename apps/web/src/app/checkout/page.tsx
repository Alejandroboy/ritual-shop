'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@utils';
import { api } from '@utils';
import { useAppStore } from '../../state/app-store';
import AssetThumb from '../../components/asset-thumb';
import { bytesToSize } from '@utils';

type FilesByItem = Record<string, File[]>;
type ProgressByItem = Record<string, number>;
type ErrorsByItem = Record<string, string | null>;

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(useAppStore.persist.hasHydrated());
    const unsub = useAppStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return () => unsub();
  }, []);
  return hydrated;
}

type Order = {
  id: string;
};

type OrderDetails = {
  id: string;
  templateLabel: string;
  templateCode: string;
  size: {
    label: string;
  };
  assets: {
    id: string;
    originalName: string;
    size: number;
  }[];
};

type User = {
  userId: string;
  email: string;
  name: string;
  phone: string;
};
export default function CheckoutPage() {
  const router = useRouter();
  const draftOrderId = useAppStore((s) => s.draftOrderId);
  const clearDraft = useAppStore((s) => s.clearDraft);
  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);
  const hydrated = useHydrated();
  const [orderItems, setOrderItems] = useState<OrderDetails[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [ignore, setIgnore] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    email: '',
    name: '',
    phone: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const API_BASE = getApiBase();

  useEffect(() => {
    if (!hydrated) return;
    if (draftOrderId === null) {
      router.replace('/catalog');
    }
  }, [hydrated, draftOrderId, router]);

  useEffect(() => {
    if (!me) fetchMe().catch(() => {});
  }, [me, fetchMe]);

  async function load() {
    if (!draftOrderId) return;
    setForm({
      userId: me?.id || '',
      email: me?.email || '',
      name: me?.name || '',
      phone: me?.phone || '',
    });
    try {
      const data = await api<OrderDetails>(`/orders/${draftOrderId}`);
      if (!ignore) setOrderItems(data?.items ? data?.items : null);
    } catch (e) {
      console.warn('getOrderDetails error', e);
      clearDraft();
      router.replace('/catalog');
    }
  }

  useEffect(() => {
    if (!hydrated || !draftOrderId) return;
    load();
    return () => {
      setIgnore(true);
    };
  }, [hydrated, draftOrderId, clearDraft, router]);

  const items = useMemo(() => orderItems ?? [], [orderItems]);

  async function deleteItem(orderId: string, itemId: string) {
    setIgnore(false);
    try {
      const data = await api<{ id: string }>(
        `/orders/${orderId}/items/${itemId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (data && data.ok) {
        load();
        setIgnore(true);
      }
    } catch (e) {
      alert(`Ошибка удаления позиции`);
      console.log('e', e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draftOrderId) return;
    setLoading(true);
    const payload = {
      userId: String(form.userId || me?.id || ''),
      email: String(form.email || ''),
      name: String(form.name || ''),
      phone: form.phone || '',
    };
    try {
      const data = await api<{ id: string }>(
        `/orders/${draftOrderId}/checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      clearDraft();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('draftOrderId');
        localStorage.removeItem('orderId');
      }
      router.push(`/order/${data.id}`);
    } catch (e) {
      const msg = e?.message || '';
      console.error('checkout error', e);
      alert(`Ошибка оформления заказа${msg ? `: ${msg}` : ''}`);
    } finally {
      alert('Заказ оформлен');
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-2xl px-4 py-8">Загрузка…</div>;
  }

  if (!draftOrderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">Переход в каталог…</div>
    );
  }

  const renderOrder = () => {
    return (
      <>
        <h1 className="text-2xl font-semibold mb-6">В заказе</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orderItems?.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-white p-4 flex flex-col gap-2 relative"
            >
              <div
                className="absolute top-[10px] right-[10px] cursor-pointer"
                onClick={() => deleteItem(draftOrderId, item.id)}
              >
                <svg
                  className="w-[20px] h-[20px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p>{item.templateLabel}</p>
              <p>{item.size?.label}</p>
              {!!item?.comment && <p>{item?.comment}</p>}
              {!!item.assets.length && (
                <div className="flex gap-3 flex-wrap">
                  {item.assets.map((a) => (
                    <div key={a.id} className="text-xs">
                      <AssetThumb asset={a} size={120} />
                      <div className="mt-1 truncate max-w-[120px]">
                        {a.originalName || 'файл'}
                      </div>
                      <div className="text-gray-500">
                        {bytesToSize(a.size || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderSubmitForm = () => {
    return (
      <>
        <h2 className="text-2xl font-semibold my-6">Оформление заказа</h2>
        <button
          onClick={handleSubmit}
          disabled={!draftOrderId || loading || items.length === 0}
          className="px-4 py-2 rounded-md bg-neutral-900 text-white disabled:opacity-50"
        >
          {loading ? 'Оформляем…' : 'Оформить заказ'}
        </button>
      </>
    );
  };

  const renderCheckout = () => {
    if (!orderItems?.length) {
      return <h2>Заказ пуст. Перейдите в каталог для выбора позиций</h2>;
    }
    if (orderItems) {
      return (
        <>
          {renderOrder()}
          {renderSubmitForm()}
        </>
      );
    }
  };

  return <div className="mx-auto max-w-2xl px-4 py-8">{renderCheckout()}</div>;
}
