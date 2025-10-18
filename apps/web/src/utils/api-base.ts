export function getApiBase() {
  if (typeof window === 'undefined') {
    return process.env.API_BASE ?? 'http://localhost:3001/api';
  }
  return process.env.NEXT_PUBLIC_API_BASE ?? '/api';
}
