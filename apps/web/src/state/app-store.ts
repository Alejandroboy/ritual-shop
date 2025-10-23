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
type HydrationSlice = { _hydrated: boolean };

export type AppState = OrderSlice &
  UploadsSlice &
  CatalogSlice &
  UserSlice &
  OrdersSlice &
  HydrationSlice;

const isBrowser = typeof window !== 'undefined';

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get, api) => ({
          _hydrated: false,
          ...createUserSlice(set, get, api),
          ...createOrderSlice(set, get, api),
          ...createUploadsSlice(set, get, api),
          ...createCatalogSlice(set, get, api),
          ...createOrdersSlice(set, get, api),
        })),
      ),
      {
        name: 'app-store',
        storage: isBrowser ? createJSONStorage(() => localStorage) : undefined,
        version: 1,
        partialize: (s) => ({
          me: s.me
            ? {
                id: s.me.id,
                email: s.me.email,
                name: s.me.name,
                phone: s.me.phone,
              }
            : null,
          draftOrderId: s.draftOrderId,
        }),
      },
    ),
  ),
);
