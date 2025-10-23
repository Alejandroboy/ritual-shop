'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '../state/app-store';

type PersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (cb: () => void) => () => void;
};

function getPersistApi(): PersistApi | null {
  const storeObj = useAppStore as unknown as { persist?: Partial<PersistApi> };

  const maybe = storeObj.persist;
  if (!maybe) return null;

  const { hasHydrated, onFinishHydration } = maybe;
  if (
    typeof hasHydrated !== 'function' ||
    typeof onFinishHydration !== 'function'
  ) {
    return null;
  }
  return { hasHydrated, onFinishHydration };
}

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const api = getPersistApi();
    if (!api) {
      setHydrated(true);
      return;
    }

    setHydrated(api.hasHydrated());
    const unsub = api?.onFinishHydration(() => setHydrated(true));
    return () => {
      unsub();
    };
  }, []);

  return hydrated;
}
