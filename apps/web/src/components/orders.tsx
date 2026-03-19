'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { adminApiFetch } from '@utils';
import {
  InvoiceStatusEnum,
  Order,
  OrderItemDetails,
  OrderStatusEnum,
} from '@types';
import { labelOf, orderStatusLabels, invoiceStatusLabel } from '@utils';
import { OrdersFilterBar } from './orders-filter-bar';
import { useSearchParams } from 'next/navigation';

export function Orders() {
  const sp = useSearchParams();
  const qs = sp.toString();
  const key = `/api/admin/orders${qs ? `?${qs}` : ''}`;
  const { data } = useSWR(key, (u) => adminApiFetch(u).then((r) => r.json()));
  const items = data?.items ?? [];
  const orderLabel = labelOf<string>(orderStatusLabels);
  const invoiceLabel = labelOf<string>(invoiceStatusLabel);

  function chooseClass(status: string): string {
    if (status === 'PAID') return 'text-green-600';
    return 'text-red-600';
  }
  const renderApproval = (item: OrderItemDetails) => {
    if (item?.approved && item?.approveNeeded) {
      return (
        <div className="text-sm text-gray-600">
          <span className="line-through">Нужно согласование</span>&nbsp;
          <span>Согласовано</span>
        </div>
      );
    }
    if (item?.approveNeeded) {
      return <div className="text-sm text-red-600">Нужно согласование</div>;
    }
    return null;
  };

  const renderRetouch = (item: OrderItemDetails) => {
    const retouchedAssets = item?.assets.filter(
      (asset) => asset.stage === 'RETOUCHED',
    );
    if (item?.retouchNeeded && retouchedAssets.length > 0) {
      return (
        <div className="text-sm text-gray-600">
          <span className="line-through">Нужна ретушь</span>&nbsp;
          <span>Ретушь добавлена</span>
        </div>
      );
    }
    if (item?.retouchNeeded) {
      return <div className="text-sm text-red-600">Нужна ретушь</div>;
    }
  };

  return (
    <div>
      <OrdersFilterBar />
      <ul className="space-y-2">
        {items.map((o: Order) => {
          const created = o.createdAt
            ? new Date(o.createdAt as unknown as string)
            : null;

          return (
            <li key={o.id} className="p-3 border rounded-xl">
              <div className="font-mono">{o.number}</div>
              {renderRetouch(o.items)}
              {renderApproval(o.items)}
              <div className="text-sm text-gray-600">
                {orderLabel(o.orderStatus as OrderStatusEnum)}
              </div>
              <div className="text-sm text-gray-500">
                {created ? created.toLocaleString() : '—'}
                {' • '}
                {o.customerEmail ?? 'без пользователя'}
                {' • '}
                {o.customerName ?? 'без имени'}
              </div>
              {o.includedInInvoice && (
                <div className="text-sm ">
                  Включен в счет {o.invoiceName}&nbsp;
                  {o?.invoice ? (
                    <span className={chooseClass(o?.invoice.status)}>
                      {invoiceLabel(o?.invoice.status as InvoiceStatusEnum)}
                    </span>
                  ) : (
                    ''
                  )}
                </div>
              )}
              <Link className="underline" href={`/admin/orders/${o.id}`}>
                Открыть
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
