import { api } from '@utils';

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

const mapAsset = (a: any): MyAsset => ({
  id: a.id,
  originalName: a.originalName ?? a.filename ?? null,
  contentType: a.contentType ?? a.mime ?? null,
  size: a.size ?? null,
});

const mapItem = (i: any): MyOrderItem => ({
  id: i.id,
  templateLabel: i.templateLabel,
  comment: i.comment,
  sizeLabel: i.size?.label ?? null,
  assets: Array.isArray(i.assets) ? i.assets.map(mapAsset) : [],
});

const mapOrder = (o: any): MyOrder => ({
  id: o.id,
  createdAt: o.createdAt,
  orderStatus: o.orderStatus,
  totalMinor: o.totalMinor,
  items: Array.isArray(o.items) ? o.items.map(mapItem) : [],
});

export const createOrdersSlice = (set: any): OrdersSlice => ({
  myOrders: null,
  isLoadingOrders: false,

  loadMyOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      const resp = await api<any>('/users/me', {
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
