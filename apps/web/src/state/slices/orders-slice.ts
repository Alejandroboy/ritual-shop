import { api } from '@utils';
import { StateCreator } from 'zustand/vanilla';
import { AppState } from '../app-store';
import { CustomerOrder, User } from '@types';

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
  userActionNeeded: boolean;
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
  ordersTotal: number;
  ordersPage: number;
  ordersPageSize: number;
  loadMyOrders: (page?: number, pageSize?: number) => Promise<MyOrder[]>;
  clearOrders: () => void;
};

type MW = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
];

type OrdersCreator = StateCreator<AppState, MW, [], OrdersSlice>;

const mapOrder = (o: CustomerOrder): MyOrder => ({
  id: o.id,
  createdAt: o.createdAt,
  orderStatus: o.orderStatus,
  orderNumber: o.orderNumber,
  totalMinor: o.totalMinor,
  items: o.items,
});

type MyOrdersResponse = {
  items: CustomerOrder[];
  total: number;
  page: number;
  pageSize: number;
};

export const createOrdersSlice: OrdersCreator = (
  set,
  _get,
  _api,
): OrdersSlice => ({
  myOrders: null,
  isLoadingOrders: false,
  ordersTotal: 0,
  ordersPage: 1,
  ordersPageSize: 10,

  loadMyOrders: async (page = 1, pageSize = 10) => {
    set({ isLoadingOrders: true });

    try {
      const resp = await api<MyOrdersResponse>(
        `/users/me/orders?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );
      const orders = (resp?.items ?? []).map(mapOrder);
      set({
        myOrders: orders,
        ordersTotal: Number(resp?.total ?? 0),
        ordersPage: Number(resp?.page ?? page),
        ordersPageSize: Number(resp?.pageSize ?? pageSize),
      });

      return orders;
    } finally {
      set({ isLoadingOrders: false });
    }
  },

  clearOrders: () =>
    set({
      myOrders: null,
      ordersTotal: 0,
      ordersPage: 1,
      ordersPageSize: 10,
    }),
});
