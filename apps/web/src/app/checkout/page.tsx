'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@utils';
import { api } from '@utils';
import { useAppStore } from '../../state/app-store';

type FilesByItem = Record<string, File[]>;
type ProgressByItem = Record<string, number>;
type ErrorsByItem = Record<string, string | null>;

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // моментальная проверка
    setHydrated(useAppStore.persist.hasHydrated());
    // событие окончания
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
  items: {
    id: string;
    templateLabel: string;
    templateCode: string;
    size: {
      label: string;
    };
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
  console.log('draftOrderId checout page', draftOrderId);
  const clearDraft = useAppStore((s) => s.clearDraft);
  const me = useAppStore((s) => s.me);
  const fetchMe = useAppStore((s) => s.fetchMe);
  const hydrated = useHydrated();
  console.log('hydrated', hydrated);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [filesByItem, setFilesByItem] = useState<FilesByItem>({});
  const [progressByItem, setProgressByItem] = useState<ProgressByItem>({});
  const [errorsByItem, setErrorsByItem] = useState<ErrorsByItem>({});
  const [form, setForm] = useState({
    userId: '',
    email: '',
    name: '',
    phone: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const API_BASE = getApiBase();

  useEffect(() => {
    console.log('useEffect draftOrderId', draftOrderId);
    if (!hydrated) return;
    if (draftOrderId === null) {
      router.replace('/catalog');
    }
  }, [hydrated, draftOrderId, router]);

  useEffect(() => {
    if (!me) fetchMe().catch(() => {});
    setForm({
      userId: me?.user?.id || '',
      email: me?.user?.email || '',
      name: me?.user?.name || '',
      phone: me?.user?.phone || '',
    });
  }, [me, fetchMe]);

  useEffect(() => {
    if (!hydrated || !draftOrderId) return;
    let ignore = false;
    async function load() {
      if (!draftOrderId) return;
      try {
        const data = await api<OrderDetails>(`/orders/${draftOrderId}`);
        if (!ignore) setOrder(data);
      } catch (e) {
        console.warn('getOrderDetails error', e);
        // если заказа по id нет — очищаем черновик и уводим в каталог
        clearDraft();
        router.replace('/catalog');
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [hydrated, draftOrderId, clearDraft, router]);

  const items = useMemo(() => order?.items ?? [], [order]);
  console.log('items', items);
  console.log('form', form);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draftOrderId) return;
    setLoading(true);
    console.log('form', form);
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
      // очистим черновой заказ в zustand (persist), чтобы не цепляться к старому
      clearDraft();
      // на всякий случай подчистим старые ключи, если вдруг где-то остались
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

  // async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   if (!orderId) return;
  //   setLoading(true);
  //   console.log('JSON.stringify(form)', JSON.stringify(form));
  //   try {
  //     const data = await api<Order>(`/orders/${orderId}/checkout`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(form),
  //     });
  //     window.localStorage.removeItem('orderId');
  //     window.localStorage.removeItem('draftOrderId');
  //     router.push(`/order/${data.id}`);
  //   } catch (e) {
  //     alert('Ошибка оформления заказа');
  //     console.log('e Ошибка оформления заказа', e);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // Прелоадер до гидратации
  if (!hydrated) {
    return <div className="mx-auto max-w-2xl px-4 py-8">Загрузка…</div>;
  }

  // Если гидратировались, но id нет — редирект случится в useEffect; можно показать skeleton
  if (!draftOrderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">Переход в каталог…</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {order && (
        <>
          <h1 className="text-2xl font-semibold mb-6">В заказе</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border bg-white p-4 flex flex-col gap-2"
              >
                <p>{item.templateLabel}</p>
                <p>{item.size?.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h1 className="text-2xl font-semibold my-6">Оформление заказа</h1>
      <button
        onClick={handleSubmit}
        disabled={!draftOrderId || loading || items.length === 0}
        className="px-4 py-2 rounded-md bg-neutral-900 text-white disabled:opacity-50"
      >
        {loading ? 'Оформляем…' : 'Оформить заказ'}
      </button>
    </div>
  );
}
