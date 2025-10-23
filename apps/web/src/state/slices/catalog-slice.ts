import type { Draft } from 'immer';
import type { Template, TemplateFilter } from '../../types';
import { api } from '@utils';
import { AppState } from '../app-store';
import { StateCreator } from 'zustand/vanilla';

export type CatalogSlice = {
  templatesByKey: Record<string, Template[] | undefined>;
  staleAtByKey: Record<string, number | undefined>;
  ttlMs: number;

  getTemplates: (filter: TemplateFilter) => Promise<Template[]>;
  invalidateTemplates: (filter?: TemplateFilter) => void;
};

type MW = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
];

type CatalogCreator = StateCreator<AppState, MW, [], CatalogSlice>;

const keyOf = (f: TemplateFilter) =>
  JSON.stringify({
    q: f.q || '',
    sizeId: f.sizeId || null,
    frameId: f.frameId || null,
    backgroundId: f.backgroundId || null,
    holePattern: f.holePattern || null,
  });

export const createCatalogSlice: CatalogCreator = (
  set,
  get,
  _api,
): CatalogSlice => ({
  templatesByKey: {},
  staleAtByKey: {},
  ttlMs: 10 * 60 * 1000,

  getTemplates: async (filter) => {
    const k = keyOf(filter);
    const now = Date.now();
    const { templatesByKey, staleAtByKey, ttlMs } = get();

    if (templatesByKey[k] && (staleAtByKey[k] || 0) > now) {
      return templatesByKey[k]!;
    }
    const qs = new URLSearchParams();
    if (filter.q) qs.set('q', filter.q);
    if (filter.sizeId) qs.set('sizeId', String(filter.sizeId));
    if (filter.frameId) qs.set('frameId', String(filter.frameId));
    if (filter.backgroundId)
      qs.set('backgroundId', String(filter.backgroundId));
    if (filter.holePattern) qs.set('holePattern', filter.holePattern);

    const list = await api<Template[]>(`/catalog/templates?${qs}`, {
      method: 'GET',
    });

    set((s) => {
      s.templatesByKey[k] = list;
      s.staleAtByKey[k] = now + ttlMs;
    });

    return list;
  },

  invalidateTemplates: (filter) => {
    if (!filter) {
      set({ templatesByKey: {}, staleAtByKey: {} });
      return;
    }
    const k = keyOf(filter);
    set((s) => {
      delete s.templatesByKey[k];
      delete s.staleAtByKey[k];
    });
  },
});
