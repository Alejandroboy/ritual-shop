import { api } from '@utils';
import { StateCreator } from 'zustand/vanilla';
import { AppState } from '../app-store';
import { access } from 'node:fs';
import {
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderItemAsset,
  User,
} from '../../types';

export type MyAsset = {
  id: string;
  originalName?: string | null;
  contentType?: string | null;
  size?: number | null;
};

export type MyOrderItem = {
  id: string;
  templateLabel: string;
  comment?: string | null;
  sizeId?: string | null;
  assets: MyAsset[];
};

export type MyOrder = {
  id: string;
  createdAt: string;
  orderStatus: string;
  totalMinor: number;
  items: MyOrderItem[];
};

export type OrdersSlice = {
  myOrders: MyOrder[] | null;
  isLoadingOrders: boolean;
  loadMyOrders: () => Promise<MyOrder[]>;
  clearOrders: () => void;
};

type MW = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
];

type OrdersCreator = StateCreator<AppState, MW, [], OrdersSlice>;

const mapAsset = (a: CustomerOrderItemAsset): MyAsset => ({
  id: a.id,
  originalName: a.filename ?? null,
  contentType: a.mime ?? null,
  size: a.size ?? null,
});

const mapItem = (i: CustomerOrderItem): MyOrderItem => ({
  id: i.id,
  templateLabel: i.templateLabel,
  comment: i.comment,
  sizeId: i.sizeId ?? null,
  assets: Array.isArray(i.assets) ? i.assets.map(mapAsset) : [],
});

const mapOrder = (o: CustomerOrder): MyOrder => ({
  id: o.id,
  createdAt: o.createdAt,
  orderStatus: o.orderStatus,
  totalMinor: o.totalMinor,
  items: Array.isArray(o.items) ? o.items.map(mapItem) : [],
});

type UserResponse = {
  user: User;
};

export const createOrdersSlice: OrdersCreator = (
  set,
  _get,
  _api,
): OrdersSlice => ({
  myOrders: null,
  isLoadingOrders: false,

  loadMyOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      const resp = await api<UserResponse>('/users/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const ordersRaw = resp?.user?.customerOrders ?? [];
      const orders = ordersRaw.map(mapOrder);
      set({ myOrders: orders });
      return orders;
    } finally {
      set({ isLoadingOrders: false });
    }
  },

  clearOrders: () => set({ myOrders: null }),
});
