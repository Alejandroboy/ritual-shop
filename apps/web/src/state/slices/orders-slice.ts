import { api } from '@utils';
import { StateCreator } from 'zustand/vanilla';
import { AppState } from '../app-store';
import {
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderItemAsset,
  User,
} from '@types';

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
  sizeLabel?: string | null;
  assets: MyAsset[];
  dateOfBirth: string;
  dateOfDeath: string;
  firstName: string;
  middleName: string;
  lastName: string;
  approveNeeded: boolean;
  approved: boolean;
  approvalStage: string;
};

export type MyOrder = {
  id: string;
  createdAt: string;
  orderStatus: string;
  totalMinor: number;
  items: MyOrderItem;
  orderNumber: string;
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
  templateLabel: i.template.label,
  comment: i.comment,
  sizeLabel: i.size.label ?? null,
  dateOfBirth: i.dateOfBirth,
  dateOfDeath: i.dateOfDeath,
  firstName: i.firstName,
  middleName: i.middleName,
  lastName: i.lastName,
  assets: Array.isArray(i.assets) ? i.assets.map(mapAsset) : [],
  approveNeeded: i.approveNeeded,
  approvalStage: i.approvalStage,
  approved: i.approved,
});

const mapOrder = (o: CustomerOrder): MyOrder => ({
  id: o.id,
  createdAt: o.createdAt,
  orderStatus: o.orderStatus,
  orderNumber: o.orderNumber,
  totalMinor: o.totalMinor,
  items: o.items,
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
      console.log('resp?.user?.customerOrders', resp?.user?.customerOrders);
      const orders = ordersRaw.map(mapOrder);
      set({ myOrders: orders });
      return orders;
    } finally {
      set({ isLoadingOrders: false });
    }
  },

  clearOrders: () => set({ myOrders: null }),
});
