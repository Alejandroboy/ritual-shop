import type { Me } from '../../types';
import { api } from '@utils';
import { StateCreator } from 'zustand/vanilla';
import { AppState } from '../app-store';
import { UploadsSlice } from './upload-slice';

export type UserSlice = {
  me: Me;
  setMe: (u: Me) => void;
  fetchMe: () => Promise<void>;
};

type MW = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
];

type UserCreator = StateCreator<AppState, MW, [], UserSlice>;

type UserResponse = {
  user: Me;
};

export const createUserSlice: UserCreator = (set, _get, _api): UserSlice => ({
  me: null,
  setMe: (u) => set({ me: u }),
  fetchMe: async () => {
    try {
      const data = await api<UserResponse>('/users/me', { method: 'GET' });
      if (!data?.user) {
        set({ me: null });
        throw new Error('Unauthenticated');
      }
      set({ me: data.user });
    } catch {
      /* ignore */
    }
  },
});
