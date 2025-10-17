import type { Id, OrderItem } from '../../types';
import { api } from '@utils';

export type OrderDetails = {
  id: Id;
  items: Array<{
    id: Id;
    templateLabel: string;
    size?: { label?: string } | null;
    // если на бэке уже добавлены presigned URL — можно сразу расширить типом assets тут
  }>;
};

export type OrderSlice = {
  draftOrderId: Id | null;

  // управление черновиком
  setDraft: (id: Id | null) => void;
  ensureOrder: () => Promise<Id>;
  clearDraft: () => void;

  // позиции
  addItem: (payload: {
    templateCode: string;
    sizeId?: number;
    frameId?: number;
    backgroundId?: number;
    holePattern?: string;
    finish?: string;
    comment?: string;
  }) => Promise<OrderItem>;

  // вспомогательные действия страницы чекаута
  getOrderDetails: () => Promise<OrderDetails | null>;
  checkout: (payload: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
  }) => Promise<{ id: Id }>;
};

export const createOrderSlice = (set: any, get: any): OrderSlice => ({
  draftOrderId: null,

  setDraft: (id) => set({ draftOrderId: id }),

  // создаём черновой заказ, если ещё нет
  ensureOrder: async () => {
    const existing = get().draftOrderId as Id | null;
    if (existing) return existing;

    const data = await api<{ id: Id }>('/orders', { method: 'POST' });
    set({ draftOrderId: data.id }); // persist сам сохранит в localStorage
    return data.id;
  },

  clearDraft: () => set({ draftOrderId: null }),

  addItem: async (payload) => {
    const orderId = await get().ensureOrder();
    return api<OrderItem>(`/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  getOrderDetails: async () => {
    const orderId = get().draftOrderId as Id | null;
    if (!orderId) return null;
    return api<OrderDetails>(`/orders/${orderId}`);
  },

  checkout: async (payload) => {
    const orderId = get().draftOrderId as Id | null;
    if (!orderId) throw new Error('Нет чернового заказа');

    const res = await api<{ id: Id }>(`/orders/${orderId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    // заказ оформлен — чистим черновик
    set({ draftOrderId: null });
    return res;
  },
});
