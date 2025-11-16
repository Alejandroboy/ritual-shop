export const asDate = (s?: string | null) =>
  s ? new Date(s + 'T00:00:00Z') : null;

export const toDateString = (d: Date | null) =>
  d ? d.toISOString().slice(0, 10) : null;
