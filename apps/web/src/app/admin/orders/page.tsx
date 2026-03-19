import { Orders } from '../../../components/orders';
import { Suspense } from 'react';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const qs = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      Array.isArray(v)
        ? v.map((x) => [k, String(x)])
        : v
          ? [[k, String(v)]]
          : [],
    ) as [string, string][],
  ).toString();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Заказы</h1>
      <Suspense fallback={<div> Загружаем заказы ... </div>}>
        <Orders />
      </Suspense>
    </div>
  );
}
