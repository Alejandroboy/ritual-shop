export async function adminApiFetch(input: string, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    cache: 'no-store',
    credentials: 'include',
    headers: { ...(init?.headers || {}) },
  });
  console.log('res', res);
  if (!res.ok)
    throw new Error(
      `${res.status} ${res.statusText}: ${await res.text().catch(() => '')}`,
    );
  return res;
}
