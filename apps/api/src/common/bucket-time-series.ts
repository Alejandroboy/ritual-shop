type Grain = 'day' | 'week' | 'month';
function step(d: Date, g: Grain): void {
  if (g === 'day') {
    d.setDate(d.getDate() + 1);
    return;
  }
  if (g === 'week') {
    d.setDate(d.getDate() + 7);
    return;
  }
  /* g === 'month' */ d.setMonth(d.getMonth() + 1);
}
export function bucketTimeSeries(
  dates: Date[],
  from: Date,
  to: Date,
  grain: 'day' | 'week' | 'month',
) {
  const start = startOf(from, grain);
  const end = endOf(to, grain);
  const labels: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    labels.push(keyOf(cursor, grain));
    step(cursor, grain);
  }
  const counts = Object.fromEntries(labels.map((l) => [l, 0]));
  for (const d of dates) {
    const k = keyOf(d, grain);
    if (k in counts) counts[k] += 1;
  }
  return labels.map((l) => ({ bucket: l, count: counts[l] }));
}

function startOf(d: Date, g: 'day' | 'week' | 'month') {
  const x = new Date(d);
  if (g === 'day') {
    x.setHours(0, 0, 0, 0);
    return x;
  }
  if (g === 'week') {
    const day = (x.getDay() + 6) % 7; // ISO week, Monday=0
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  // month
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOf(d: Date, g: 'day' | 'week' | 'month') {
  const x = new Date(d);
  if (g === 'day') {
    x.setHours(23, 59, 59, 999);
    return x;
  }
  if (g === 'week') {
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() + (6 - day));
    x.setHours(23, 59, 59, 999);
    return x;
  }
  // month
  x.setMonth(x.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}
function keyOf(d: Date, g: 'day' | 'week' | 'month') {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (g === 'day') return `${y}-${m}-${day}`;
  if (g === 'week') {
    // approximate ISO week label: yyyy-Www by Monday-start
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    const dayN = (dd.getDay() + 6) % 7;
    dd.setDate(dd.getDate() - dayN);
    const weekStart = dd.toISOString().slice(0, 10);
    return `W:${weekStart}`; // «неделя, начавшаяся в ...»
  }
  return `${y}-${m}`;
}
