export const asDate = (s?: string | null) =>
  s ? new Date(s + 'T00:00:00Z') : null;

export const toDateString = (d: Date | null) =>
  d ? d.toISOString().slice(0, 10) : null;

export type RemoteInvoiceLike = {
  id?: string;
  name?: string | null;
  description?: string | null;
  sum?: number;
  payedSum?: number;
  created?: string | null;
  updated?: string | null;
};

export function resolveInvoiceStatus(input: {
  sum?: number;
  payedSum?: number;
}): 'UNPAID' | 'PARTIAL' | 'PAID' {
  const total = typeof input.sum === 'number' ? input.sum : 0;
  const paid = typeof input.payedSum === 'number' ? input.payedSum : 0;

  if (paid <= 0) return 'UNPAID';
  if (paid < total) return 'PARTIAL';
  return 'PAID';
}

export function getNextInvoiceCheckAt(params: {
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  createdAt: Date;
}): Date | null {
  if (params.status === 'PAID') return null;

  const ageMs = Date.now() - params.createdAt.getTime();

  if (ageMs < 2 * 60 * 60 * 1000) {
    return new Date(Date.now() + 5 * 60 * 1000);
  }

  if (ageMs < 24 * 60 * 60 * 1000) {
    return new Date(Date.now() + 30 * 60 * 1000);
  }

  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}
