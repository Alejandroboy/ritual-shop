export function getApiBase() {
  // На сервере (SSR/Server Components) читаем API_BASE,
  // в браузере — NEXT_PUBLIC_API_BASE. Фоллбек — '/api' (если захочешь вернуться к рерайтам).
  if (typeof window === 'undefined') {
    return process.env.API_BASE ?? 'http://localhost:3001/api';
  }
  return process.env.NEXT_PUBLIC_API_BASE ?? '/api';
}
