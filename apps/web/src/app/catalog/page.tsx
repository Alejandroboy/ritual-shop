import FilterBar from '../../components/filter-bar';
import TemplateCard from '../../components/template-card';
import { api, type TemplateListItem } from '../../../api';
import { getApiBase } from '../../utils/api-base';

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
  // for (const k of [
  //   'material',
  //   'shape',
  //   'orientation',
  //   'colorMode',
  //   'coverage',
  //   'page',
  //   'pageSize',
  // ]) {
  //   const v = searchParams && (await searchParams[k]);
  //   if (v) q.set(k, v);
  // }
  if (!q.has('pageSize')) q.set('pageSize', '24');
  const API_BASE = getApiBase();

  const data = await api<ListResp>(
    `${API_BASE}/catalog/templates?${q.toString()}`,
  );

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
