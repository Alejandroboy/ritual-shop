import FilterBar from '../../components/filter-bar';
import TemplateCard from '../../components/template-card';
import { api, type TemplateListItem } from '@utils';

type ListResp = {
  total: number;
  page: number;
  pageSize: number;
  items: TemplateListItem[];
};

export const dynamic = 'force-dynamic'; // на всякий

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const q = new URLSearchParams();
  if (!q.has('pageSize')) q.set('pageSize', '24');

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
