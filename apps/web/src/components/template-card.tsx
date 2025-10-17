import Link from 'next/link';
import type { TemplateListItem } from '../utils/api';

export default function TemplateCard({ t }: { t: TemplateListItem }) {
  return (
    <div className="rounded-xl border bg-white p-4 flex flex-col gap-2">
      <div className="text-sm text-neutral-500">{t.code}</div>
      <div className="font-medium">{t.label}</div>
      <div className="text-xs text-neutral-600">
        {t.material} · {t.shape}
        {t.orientation ? ` · ${t.orientation}` : ''} · {t.colorMode}
      </div>
      <Link
        href={`/catalog/${t.code}`}
        className="mt-auto px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white inline-block w-fit"
      >
        Открыть
      </Link>
    </div>
  );
}
