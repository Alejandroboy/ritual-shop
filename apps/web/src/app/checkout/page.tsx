'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@utils';
import { api } from '../../../api';

type FilesByItem = Record<string, File[]>;
type ProgressByItem = Record<string, number>;
type ErrorsByItem = Record<string, string | null>;

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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
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
      getUser();
    } catch {
      router.push('/catalog');
    }
  }, [router]);

  const items = useMemo(() => orderDetails?.items ?? [], [orderDetails]);
  const getUser = async () => {
    const data = await api('/users/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', //
    });
    console.log('data', data);
    const { user } = data;
    setUser(user);
    setForm({
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    });
  };
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
    console.log('JSON.stringify(form)', JSON.stringify(form));
    try {
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
                  <p>{item?.size?.label}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
      <h1 className="text-2xl font-semibold mb-6">Оформление заказа</h1>
      <button onClick={handleSubmit}>Оформить заказ</button>
    </div>
  );
}
