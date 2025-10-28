import FilterBar from '../../components/filter-bar';
import TemplateCard from '../../components/template-card';
import { api } from '@utils';
import { type TemplateListItem } from '@types';

type ListResp = {
  total: number;
  page: number;
  pageSize: number;
  items: TemplateListItem[];
};

export const dynamic = 'force-dynamic';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = new URLSearchParams();
  const allow = [
    'material',
    'shape',
    'orientation',
    'colorMode',
    'q',
    'page',
    'pageSize',
  ] as const;
  const awaitedSearchParams = await searchParams;

  for (const k of allow) {
    const v = awaitedSearchParams[k];
    if (Array.isArray(v)) v.forEach((x) => q.append(k, x));
    else if (v) q.set(k, v);
  }
  if (!q.has('pageSize')) q.set('pageSize', '38');

  const data = await api<ListResp>(`/catalog/templates?${q.toString()}`);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Каталог</h1>
      <FilterBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.items.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}
