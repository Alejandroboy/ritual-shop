'use client';

import { create } from 'zustand';
import {
  devtools,
  persist,
  subscribeWithSelector,
  createJSONStorage,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { OrderSlice } from './slices/order-slice';
import type { UploadsSlice } from './slices/upload-slice';
import type { CatalogSlice } from './slices/catalog-slice';
import type { UserSlice } from './slices/user-slice';
import type { OrdersSlice } from './slices/orders-slice';

import { createOrderSlice } from './slices/order-slice';
import { createUploadsSlice } from './slices/upload-slice';
import { createCatalogSlice } from './slices/catalog-slice';
import { createUserSlice } from './slices/user-slice';
import { createOrdersSlice } from './slices/orders-slice';

export type AppState = OrderSlice &
  UploadsSlice &
  CatalogSlice &
  UserSlice &
  OrdersSlice;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          _hydrated: false,
          ...createUserSlice(set),
          ...createOrderSlice(set, get),
          ...createUploadsSlice(set, get),
          ...createCatalogSlice(set, get),
          ...createOrdersSlice(set),
        })),
      ),
      {
        name: 'app-store',
        storage: createJSONStorage(() => localStorage),
        version: 1,
        partialize: (s) => ({
          me: s.me
            ? {
                id: s.me.id,
                email: (s.me as any).email,
                name: (s.me as any).name,
              }
            : null,
          draftOrderId: s.draftOrderId,
          // каталог можно не сохранять, чтобы не раздувать localStorage
        }),
        onRehydrateStorage: () => () => {
          // этот коллбек вызывается ПОСЛЕ загрузки состояния из storage
          return () => {
            set({ _hydrated: true }); // 🎯 финиш гидратации
          };
        },
      },
    ),
  ),
);
