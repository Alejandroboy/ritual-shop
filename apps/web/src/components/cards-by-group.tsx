import { api } from '@utils';
import TemplateCard from './template-card';
import type { TemplateListItem } from '@types';

type CardsByGroupProps = {
  material: string;
  shape?: string | string[];
  orientation?: string;
  coverage?: string;
};

type ListResp = {
  total: number;
  page: number;
  pageSize: number;
  items: TemplateListItem[];
};

export const CardsByGroup = async ({
  material,
  shape,
  orientation,
  coverage,
}: CardsByGroupProps) => {
  const queryString = new URLSearchParams();

  queryString.set('material', material);
  if (shape) {
    if (Array.isArray(shape)) {
      shape.forEach((item) => queryString.append('shape', item));
    } else {
      queryString.set('shape', shape);
    }
  }
  if (orientation) queryString.set('orientation', orientation);
  if (coverage) queryString.set('coverage', coverage);
  queryString.set('pageSize', '100');

  const data = await api<ListResp>(
    `/catalog/templates?${queryString.toString()}`,
  );
  console.log('data', queryString.toString());
  console.log('coverage', coverage);
  console.log('orientation', orientation);
  console.log('shape', shape);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.items.map((t) => (
        <TemplateCard key={t.id} t={t} />
      ))}
    </div>
  );
};
