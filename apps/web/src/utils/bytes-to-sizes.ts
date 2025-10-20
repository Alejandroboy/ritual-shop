export function bytesToSize(bytes: number, precision = 2) {
  if (!bytes) return '—';
  const units = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(precision)} ${units[i]}`;
}
