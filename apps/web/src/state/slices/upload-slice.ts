import type { Id, PresignResp } from '../../types';
import { api } from '@utils';

export type UploadState =
  | 'queued'
  | 'uploading'
  | 'uploaded'
  | 'registering'
  | 'done'
  | 'error';

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
};

export type UploadsSlice = {
  queue: UploadJob[];
  concurrency: number;
  running: number;

  enqueueFiles: (orderId: Id, itemId: Id | null, files: File[]) => void;
  attachPendingToItem: (orderId: Id, itemId: Id) => void;
  clearFinished: () => void;

  _pump: () => void;
};

const rid = () => Math.random().toString(36).slice(2, 10);

export const createUploadsSlice = (set: any, get: any): UploadsSlice => ({
  queue: [],
  concurrency: 2,
  running: 0,

  enqueueFiles: (orderId, itemId, files) => {
    if (!files?.length) return;
    const jobs: UploadJob[] = files.map((f) => ({
      id: rid(),
      orderId,
      itemId: itemId || null,
      file: f,
      state: 'queued',
      error: null,
    }));
    set((s: any) => ({ queue: [...s.queue, ...jobs] }));
    get()._pump();
  },

  attachPendingToItem: (orderId, itemId) => {
    set((s: any) => {
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
    set((s: any) => ({
      queue: s.queue.filter(
        (j: UploadJob) =>
          j.state === 'uploading' ||
          j.state === 'queued' ||
          j.state === 'registering' ||
          j.state === 'uploaded',
      ),
    })),

  _pump: async () => {
    const { queue, running, concurrency } = get() as UploadsSlice;
    if (running >= concurrency) return;

    const job = queue.find((j) => j.state === 'queued');
    if (!job) return;

    // пометили как занятый
    set((s: any) => {
      const j = s.queue.find((x: UploadJob) => x.id === job.id)!;
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

        set((s: any) => {
          const j = s.queue.find((x: UploadJob) => x.id === job.id)!;
          j.bucket = presign.bucket;
          j.key = presign.key;
          j.etag = etag;
        });
      }

      const current = (get() as UploadsSlice).queue.find(
        (x) => x.id === job.id,
      )!;
      if (current.itemId) {
        await api(`/orders/${current.orderId}/items/${current.itemId}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storage: 's3',
            bucket: current.bucket,
            key: current.key,
            contentType: current.file.type || undefined,
            size: current.file.size,
            etag: current.etag,
            originalName: current.file.name,
            filename: current.file.name,
          }),
        });

        set((s: any) => {
          const j = s.queue.find((x: UploadJob) => x.id === job.id)!;
          j.state = 'done';
          s.running -= 1;
        });
      } else {
        set((s: any) => {
          const j = s.queue.find((x: UploadJob) => x.id === job.id)!;
          j.state = 'uploaded';
          s.running -= 1;
        });
      }
    } catch (e: any) {
      set((s: any) => {
        const j = s.queue.find((x: UploadJob) => x.id === job.id)!;
        j.state = 'error';
        j.error = e?.message || 'Ошибка загрузки';
        s.running -= 1;
      });
    } finally {
      get()._pump();
    }
  },
});
