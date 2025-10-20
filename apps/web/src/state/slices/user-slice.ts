import type { Me } from '../../types';
import { api } from '@utils';

export type UserSlice = {
  me: Me;
  setMe: (u: Me) => void;
  fetchMe: () => Promise<void>;
};

export const createUserSlice = (set: any): UserSlice => ({
  me: null,
  setMe: (u) => set({ me: u }),
  fetchMe: async () => {
    try {
      const data = await api<Me>('/users/me', { method: 'GET' });
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
