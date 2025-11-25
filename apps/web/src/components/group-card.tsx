import Link from 'next/link';

export function GroupCard({ name, group }: { name: string; group: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 flex flex-col gap-2">
      <div className="font-medium">{name}</div>

      <Link
        href={`/catalog/${group}`}
        className="mt-auto px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white inline-block w-fit"
      >
        Открыть
      </Link>
    </div>
  );
}
