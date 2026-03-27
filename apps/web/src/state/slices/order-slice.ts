import type { Id, OrderItem } from '@types';
import { api } from '@utils';
import { StateCreator } from 'zustand/vanilla';
import { AppState } from '../app-store';

export type OrderDetails = {
  id: Id;
  items: Array<{
    id: Id;
    templateLabel: string;
    size?: { label?: string } | null;
  }>;
};

export type OrderSlice = {
  draftOrderId: Id | null;

  setDraft: (id: Id | null) => void;
  ensureOrder: () => Promise<Id>;
  clearDraft: () => void;
  updateApprove: (args: {
    orderId: string;
    userId: string;
    itemId?: string;
  }) => Promise<OrderDetails>;

  updateComment: (args: {
    orderId: string;
    text: string;
    itemId?: string;
  }) => Promise<OrderDetails>;

  addItem: (payload: {
    userId: string;
    dateOfBirth: string;
    dateOfDeath: string;
    firstName: string;
    middleName: string;
    lastName: string;
    templateCode: string;
    dateOfBirthSecondPerson?: string;
    dateOfDeathSecondPerson?: string;
    firstNameSecondPerson?: string;
    middleNameSecondPerson?: string;
    lastNameSecondPerson?: string;
    templateCodeSecondPerson?: string;
    skuCode?: string;
    sizeId?: number;
    frameId?: number;
    backgroundId?: number;
    holePattern?: string;
    finish?: string;
    comment?: string;
    approveNeeded: boolean;
    retouchNeeded: boolean;
    goldType?: string;
  }) => Promise<OrderItem>;

  getOrderDetails: () => Promise<OrderDetails | null>;
  checkout: (payload: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
  }) => Promise<{ id: Id }>;
};

type MW = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
];

type OrderCreator = StateCreator<AppState, MW, [], OrderSlice>;

export const createOrderSlice: OrderCreator = (set, get, _api): OrderSlice => ({
  draftOrderId: null,

  setDraft: (id) => set({ draftOrderId: id }),

  ensureOrder: async () => {
    const existing = get().draftOrderId as Id | null;
    if (existing) return existing;

    const data = await api<{ id: Id }>('/orders', { method: 'POST' });
    set({ draftOrderId: data.id });
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

  updateApprove: async ({ orderId, itemId, userId }) => {
    const updatedItem = await api<OrderDetails>(
      `/orders/${orderId}/items/${itemId}/approve`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: userId }),
      },
    );

    set((s) => {
      const order = s.myOrders?.find((o) => o.id === orderId);
      if (!order) return;
      order.items = { ...order.items, ...updatedItem };
    });

    return updatedItem;
  },

  updateComment: async ({ orderId, itemId, text }) => {
    const updatedItem = await api<OrderDetails>(
      `/orders/${orderId}/items/${itemId}/discus`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: text }),
      },
    );

    set((s) => {
      const order = s.myOrders?.find((o) => o.id === orderId);
      if (!order) return;
      order.items = { ...order.items, ...updatedItem };
    });

    return updatedItem;
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

    set({ draftOrderId: null });
    return res;
  },
});
