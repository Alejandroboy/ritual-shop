import type { Id, PresignResp } from '@types';
import { api } from '@utils';
import { StateCreator } from 'zustand/vanilla';
import { AppState } from '../app-store';

export type UploadState =
  | 'queued'
  | 'uploading'
  | 'uploaded'
  | 'registering'
  | 'done'
  | 'error';

type Mode = 'original' | 'retouch';

export type UploadJob = {
  id: string;
  orderId: Id;
  itemId?: Id | null;
  file: File;

  state: UploadState;
  error?: string | null;

  bucket?: string;
  key?: string;
  etag?: string | null;
  previewUrl?: string;
  mode?: Mode;
  retouchOf?: Id | null;
  userId: string | null;
};

export type UploadsSlice = {
  queue: UploadJob[];
  concurrency: number;
  running: number;

  enqueueFiles: (
    orderId: Id,
    itemId: Id | null,
    files: File[],
    opts?: { mode?: Mode; retouchOf?: Id; userId?: string },
  ) => void;

  attachPendingToItem: (orderId: Id, itemId: Id) => void;

  clearFinished: () => void;
  clearQueueByOrder: (orderId: Id) => void;
  clearQueueByItem: (orderId: Id, itemId: Id | null) => void;
  clearTerminalByOrder: (orderId: Id) => void;
  removeUploadJob: (jobId: string) => void;

  _pump: () => void;
};

type MW = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
];

type UploadsCreator = StateCreator<AppState, MW, [], UploadsSlice>;

const rid = () => Math.random().toString(36).slice(2, 10);

const isActiveState = (state: UploadState) =>
  state === 'queued' ||
  state === 'uploading' ||
  state === 'registering' ||
  state === 'uploaded';

const revokePreviewUrl = (job: UploadJob) => {
  if (job.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(job.previewUrl);
  }
};

const countRunning = (queue: UploadJob[]) =>
  queue.filter((j) => j.state === 'uploading' || j.state === 'registering')
    .length;

const splitQueue = (
  queue: UploadJob[],
  shouldKeep: (job: UploadJob) => boolean,
) => {
  const nextQueue: UploadJob[] = [];
  const removed: UploadJob[] = [];

  for (const job of queue) {
    if (shouldKeep(job)) {
      nextQueue.push(job);
    } else {
      removed.push(job);
    }
  }

  removed.forEach(revokePreviewUrl);

  return {
    nextQueue,
    running: countRunning(nextQueue),
  };
};

export const createUploadsSlice: UploadsCreator = (
  set,
  get,
  _api,
): UploadsSlice => ({
  queue: [],
  concurrency: 2,
  running: 0,

  enqueueFiles: (orderId, itemId, files, opts) => {
    if (!files?.length) return;

    const jobs: UploadJob[] = files.map((f) => ({
      id: rid(),
      orderId,
      itemId: itemId || null,
      file: f,
      state: 'queued',
      error: null,
      mode: opts?.mode ?? 'original',
      retouchOf: opts?.retouchOf ?? null,
      userId: opts?.userId ?? null,
      previewUrl: URL.createObjectURL(f),
    }));

    set((s) => ({
      queue: [...s.queue, ...jobs],
    }));

    get()._pump();
  },

  attachPendingToItem: (orderId, itemId) => {
    set((s) => {
      s.queue.forEach((j: UploadJob) => {
        if (j.orderId === orderId && j.state === 'uploaded' && !j.itemId) {
          j.itemId = itemId;
          j.state = 'queued';
        }
      });
    });

    get()._pump();
  },

  clearFinished: () =>
    set((s) => {
      const { nextQueue, running } = splitQueue(s.queue, (j) =>
        isActiveState(j.state),
      );

      return {
        queue: nextQueue,
        running,
      };
    }),

  clearQueueByOrder: (orderId) =>
    set((s) => {
      const { nextQueue, running } = splitQueue(
        s.queue,
        (j) => j.orderId !== orderId,
      );

      return {
        queue: nextQueue,
        running,
      };
    }),

  clearQueueByItem: (orderId, itemId) =>
    set((s) => {
      const { nextQueue, running } = splitQueue(
        s.queue,
        (j) => !(j.orderId === orderId && j.itemId === itemId),
      );

      return {
        queue: nextQueue,
        running,
      };
    }),

  clearTerminalByOrder: (orderId) =>
    set((s) => {
      const { nextQueue, running } = splitQueue(s.queue, (j) => {
        if (j.orderId !== orderId) return true;
        return isActiveState(j.state);
      });

      return {
        queue: nextQueue,
        running,
      };
    }),

  _pump: async () => {
    const { queue, running, concurrency } = get() as UploadsSlice;
    if (running >= concurrency) return;

    const job = queue.find((j) => j.state === 'queued');
    if (!job) return;

    set((s) => {
      const j = s.queue.find((x: UploadJob) => x.id === job.id);
      if (!j) return;

      j.state = j.key ? 'registering' : 'uploading';
      s.running += 1;
    });

    try {
      if (!job.key) {
        const presign = await api<PresignResp>('/uploads/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: job.orderId,
            itemId: job.itemId || undefined,
            filename: job.file.name,
            contentType: job.file.type || undefined,
            retouchOf: job.retouchOf || undefined,
          }),
        });

        const res = await fetch(presign.url, {
          method: 'PUT',
          headers: presign.requiredHeaders ?? {},
          body: job.file,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`S3 PUT ${res.status} ${text.slice(0, 120)}`);
        }

        const etag = res.headers.get('ETag')?.replace(/"/g, '') ?? null;

        set((s) => {
          const j = s.queue.find((x: UploadJob) => x.id === job.id);
          if (!j) return;

          j.bucket = presign.bucket;
          j.key = presign.key;
          j.etag = etag;
        });
      }

      const current = (get() as UploadsSlice).queue.find(
        (x) => x.id === job.id,
      );
      if (!current) {
        set((s) => {
          s.running = Math.max(0, s.running - 1);
        });
        get()._pump();
        return;
      }

      if (current.itemId) {
        const isRetouch = current.mode === 'retouch';

        if (isRetouch && !current.retouchOf) {
          throw new Error('retouchOf is required for retouch mode');
        }

        const url = isRetouch
          ? `/orders/${current.orderId}/items/${current.itemId}/assets/retouch`
          : `/orders/${current.orderId}/items/${current.itemId}/assets`;

        const body = isRetouch
          ? {
              storage: 's3',
              sourceAssetId: current.retouchOf,
              bucket: current.bucket,
              key: current.key,
              contentType: current.file.type || undefined,
              size: current.file.size,
              etag: current.etag,
              originalName: current.file.name,
              userId: current.userId,
            }
          : {
              storage: 's3',
              bucket: current.bucket,
              key: current.key,
              contentType: current.file.type || undefined,
              size: current.file.size,
              etag: current.etag,
              originalName: current.file.name,
            };

        await api(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        set((s) => {
          const j = s.queue.find((x: UploadJob) => x.id === job.id);
          if (!j) return;

          j.state = 'done';
          s.running = Math.max(0, s.running - 1);
        });
      } else {
        set((s) => {
          const j = s.queue.find((x: UploadJob) => x.id === job.id);
          if (!j) return;

          j.state = 'uploaded';
          s.running = Math.max(0, s.running - 1);
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';

      set((s) => {
        const j = s.queue.find((x: UploadJob) => x.id === job.id);
        if (!j) return;

        j.state = 'error';
        j.error = message || 'Ошибка загрузки';
        s.running = Math.max(0, s.running - 1);
      });
    } finally {
      get()._pump();
    }
  },

  removeUploadJob: (jobId) =>
    set((s) => {
      const { nextQueue, running } = splitQueue(s.queue, (j) => j.id !== jobId);

      return {
        queue: nextQueue,
        running,
      };
    }),
});
