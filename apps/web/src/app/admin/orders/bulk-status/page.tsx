import { Suspense } from 'react';
import { BulkStatusOrders } from '../../../../components/bulk-status-orders';

export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Массовая смена статуса</h1>
      <Suspense fallback={<div>Загружаем заказы ...</div>}>
        <BulkStatusOrders />
      </Suspense>
    </div>
  );
}
