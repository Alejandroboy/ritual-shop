'use client';
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch, api } from '@utils';
import { CustomerOrder } from '@types';
import { Fragment, Suspense, useMemo, useState } from 'react';
import { UserOrdersFilterBar } from '../../../../../components/user-orders-filter-bar';

type Material =
  | 'CERMET'
  | 'WHITE_CERAMIC_GRANITE'
  | 'BLACK_CERAMIC_GRANITE'
  | 'GLASS'
  | 'GROWTH_PHOTOCERAMICS'
  | 'ENGRAVING';

type AdditionalSku = string;
type AdditionalOption = { name: string; skuCode: AdditionalSku };

function getAdditionalOptions(material?: Material | null): AdditionalOption[] {
  const common: AdditionalOption[] = [
    { name: 'Дополнительный фон на трафарете', skuCode: '20174' },
    { name: 'Оцветнение фотографии', skuCode: '20172' },
    { name: 'Согласование', skuCode: '20168' },
  ];

  const isKeramogranit =
    material === 'WHITE_CERAMIC_GRANITE' ||
    material === 'BLACK_CERAMIC_GRANITE' ||
    material === 'GROWTH_PHOTOCERAMICS';

  if (isKeramogranit) {
    return [
      ...common,
      {
        name: 'Дополнительный человек на трафарете (керамогранит)',
        skuCode: '20175',
      },
      { name: 'Ретушь (керамогранит)', skuCode: '20181' },
      { name: 'Ретушь с другой фотографии (керамогранит)', skuCode: '20178' },
      { name: 'Сверление отверстий (керамогранит)', skuCode: '20169' },
    ];
  }
  if (material === 'GLASS') {
    return [
      ...common,
      {
        name: 'Дополнительный человек на трафарете (стекло)',
        skuCode: '20176',
      },
      { name: 'Ретушь (стекло)', skuCode: '20182' },
      { name: 'Ретушь с другой фотографии (стекло)', skuCode: '20179' },
      { name: 'Сверление отверстий (стекло)', skuCode: '20185' },
    ];
  }
  if (material === 'ENGRAVING') {
    return [
      ...common,
      {
        name: 'Дополнительный человек на трафарете (гравировка)',
        skuCode: '20177',
      },
      { name: 'Ретушь (гравировка)', skuCode: '20183' },
      { name: 'Ретушь с другой фотографии (гравировка)', skuCode: '20180' },
      { name: 'Сверление отверстий (гравировка)', skuCode: '20186' },
    ];
  }
  if (material === 'CERMET') {
    return [
      ...common,
      {
        name: 'Дополнительный человек на трафарете (металлокерамика)',
        skuCode: '20173',
      },
      { name: 'Ретушь (металлокерамика)', skuCode: '20184' },
      {
        name: 'Ретушь с другой фотографии (металлокерамика)',
        skuCode: '20171',
      },
    ];
  }
  return common;
}

function getAdditionalLabel(
  material: Material | null | undefined,
  sku: string,
): string {
  return (
    getAdditionalOptions(material).find((x) => x.skuCode === sku)?.name ?? sku
  );
}

function getOrderPrice(order: CustomerOrder): number | undefined {
  const items = order.items;
  if (items?.template?.requiresFinish && items?.template?.finishPrices.length) {
    return items.template.finishPrices.find(
      (x) => x.sizeId === items.sizeId && x.finish === items.finish,
    )?.price;
  }
  return items?.template?.allowedSizes?.find((x) => x.sizeId === items.sizeId)
    ?.price;
}

function InvoicePageInner() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const ordersPage = Math.max(1, Number(sp.get('page') || '1'));
  const ordersPageSize = Math.max(1, Number(sp.get('pageSize') || '10'));

  const { data } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  const ordersKey = useMemo(() => {
    const params = new URLSearchParams();
    [
      'status',
      'q',
      'dateFrom',
      'dateTo',
      'includedInInvoice',
      'invoiceStatus',
    ].forEach((k) => {
      const v = sp.get(k);
      if (v) params.set(k, v);
    });
    params.set('page', String(ordersPage));
    params.set('pageSize', String(ordersPageSize));
    return `/api/admin/users/${id}/orders?${params.toString()}`;
  }, [id, sp, ordersPage, ordersPageSize]);

  const { data: ordersData, mutate: mutateOrders } = useSWR(ordersKey, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  const [extraByOrderId, setExtraByOrderId] = useState<
    Record<string, Record<AdditionalSku, number>>
  >({});
  const [selectValueByOrderId, setSelectValueByOrderId] = useState<
    Record<string, AdditionalSku | ''>
  >({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [positions, setPositions] = useState<
    { orderId: string; orderNumber: string; sku: string; priceMinor: number }[]
  >([]);
  const [ordersIds, setOrdersIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const user = data?.user;
  const orders: CustomerOrder[] = ordersData?.items ?? [];
  const counterpartyId =
    user?.kontragentId ?? user?.moyskladCounterpartyId ?? null;

  function goToPage(page: number) {
    const params = new URLSearchParams(sp.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  function changePageSize(size: number) {
    const params = new URLSearchParams(sp.toString());
    params.set('pageSize', String(size));
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  const toggleOrder = (order: CustomerOrder, checked: boolean) => {
    const orderId = order.id;
    const sku = order.items.skuCode as string | undefined;
    const price = getOrderPrice(order);
    if (!sku || price == null) {
      if (checked) alert('Не удалось определить цену заказа');
      return;
    }
    setSelected((s) => ({ ...s, [orderId]: checked }));
    if (checked) {
      setPositions((prev) => [
        ...prev,
        {
          orderId,
          orderNumber: order.orderNumber ?? orderId,
          sku,
          priceMinor: price,
        },
      ]);
      setOrdersIds((prev) => [...prev, orderId]);
    } else {
      setPositions((prev) => prev.filter((p) => p.orderId !== orderId));
      setOrdersIds((prev) => prev.filter((x) => x !== orderId));
    }
  };

  function addExtra(orderId: string) {
    const sku = selectValueByOrderId[orderId];
    if (!sku) return;
    setExtraByOrderId((prev) => {
      const cur = prev[orderId] ?? {};
      return { ...prev, [orderId]: { ...cur, [sku]: (cur[sku] ?? 0) + 1 } };
    });
    setSelectValueByOrderId((prev) => ({ ...prev, [orderId]: '' }));
  }

  function removeExtra(orderId: string, sku: AdditionalSku) {
    setExtraByOrderId((prev) => {
      const cur = prev[orderId] ?? {};
      const qty = cur[sku] ?? 0;
      if (qty <= 1) {
        const { [sku]: _, ...rest } = cur;
        const out = { ...prev, [orderId]: rest };
        if (Object.keys(rest).length === 0) delete out[orderId];
        return out;
      }
      return { ...prev, [orderId]: { ...cur, [sku]: qty - 1 } };
    });
  }

  const orderNumberById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of orders) m.set(o.id, (o as any).orderNumber ?? o.id);
    return m;
  }, [orders]);

  const extraPositions = useMemo(() => {
    return ordersIds.flatMap((orderId) => {
      const extras = extraByOrderId[orderId] ?? {};
      const orderNumber = orderNumberById.get(orderId) ?? orderId;
      return Object.entries(extras).map(([sku, qty]) => ({
        sku,
        qty,
        orderId,
        orderNumber,
      }));
    });
  }, [ordersIds, extraByOrderId, orderNumberById]);

  async function getDownloadUrl(orderId: string) {
    const templateId = 'dae3ba0e-2d11-11ed-a261-0242ac120002';
    try {
      const res = await api<{ url: string }>(
        `/moy-sklad/orders/${orderId}/invoice-publication-url?templateId=${templateId}`,
        { method: 'GET', cache: 'no-store' },
      );
      if (!res?.url) {
        alert('Ссылка на счёт не получена');
        return;
      }
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error(e);
      alert('Ошибка получения ссылки');
    }
  }

  const createInvoice = async () => {
    if (!counterpartyId) {
      alert(
        'Нет kontragentId/moyskladCounterpartyId у пользователя. Сначала сделай sync по ИНН.',
      );
      return;
    }
    if (ordersIds.length === 0 || positions.length === 0) {
      alert('Ничего не выбрано');
      return;
    }
    setBusy(true);
    const orderNumberByOrderId = new Map(
      positions.map((p) => [p.orderId, p.orderNumber]),
    );
    const selectedOrderNumbers = ordersIds
      .map((oid) => orderNumberByOrderId.get(oid) ?? oid)
      .filter(Boolean);
    try {
      const res = await adminApiFetch('/api/moy-sklad/invoiceout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterpartyId,
          orderIds: ordersIds,
          invoiceDescription: `Заказы: ${selectedOrderNumbers.join(', ')}`,
          positions: [
            ...positions.map((p) => ({
              sku: p.sku,
              qty: 1,
              priceMinor: p.priceMinor,
              description: `Заказ ${p.orderNumber}`,
              label: `Заказ ${p.orderNumber}`,
            })),
            ...extraPositions.map((p) => ({
              sku: p.sku,
              qty: p.qty,
              description: `Заказ ${p.orderNumber}`,
              label: `Заказ ${p.orderNumber}`,
            })),
          ],
        }),
      });
      const text = await res.text();
      const json = text ? safeJson(text) : null;
      if (!res.ok) {
        const msg =
          (json as any)?.message ??
          (json as any)?.details?.message ??
          text ??
          'invoiceout failed';
        throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      }
      alert(
        `Счёт создан: ${(json as any)?.name ?? (json as any)?.number ?? (json as any)?.id ?? ''}`,
      );
      await mutateOrders();
      setSelected({});
      setPositions([]);
      setOrdersIds([]);
      setExtraByOrderId({});
      setSelectValueByOrderId({});
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Ошибка создания счёта');
    } finally {
      setBusy(false);
    }
  };

  if (!ordersData) return null;
  if (!ordersData.total && !ordersData.items?.length) return null;

  const total: number = ordersData.total ?? 0;
  const pageSize: number = ordersData.pageSize ?? ordersPageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.max(1, ordersPage - 2);
  const end = Math.min(totalPages, ordersPage + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div data-qa="InvoicePage">
      <UserOrdersFilterBar />

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">
            Всего заказов: {total}. Страница {ordersPage} из {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">На странице:</span>
            <select
              className="border rounded-lg px-3 py-2"
              value={ordersPageSize}
              onChange={(e) => changePageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-lg border px-3 py-2 disabled:opacity-50"
              disabled={ordersPage <= 1}
              onClick={() => goToPage(ordersPage - 1)}
            >
              Назад
            </button>

            {pages[0] > 1 && (
              <>
                <button
                  className="rounded-lg border px-3 py-2"
                  onClick={() => goToPage(1)}
                >
                  1
                </button>
                {pages[0] > 2 && <span className="px-1">…</span>}
              </>
            )}

            {pages.map((p) => (
              <button
                key={p}
                className={`rounded-lg border px-3 py-2 ${p === ordersPage ? 'bg-black text-white' : ''}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}

            {pages[pages.length - 1] < totalPages && (
              <>
                {pages[pages.length - 1] < totalPages - 1 && (
                  <span className="px-1">…</span>
                )}
                <button
                  className="rounded-lg border px-3 py-2"
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              className="rounded-lg border px-3 py-2 disabled:opacity-50"
              disabled={ordersPage >= totalPages}
              onClick={() => goToPage(ordersPage + 1)}
            >
              Вперёд
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={createInvoice}
          disabled={busy || ordersIds.length === 0}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Создаю…' : `Создать счёт (${ordersIds.length})`}
        </button>
      </div>

      {orders.map((order: CustomerOrder) => {
        const createdAt = new Date(order.createdAt);
        const price = getOrderPrice(order) ?? 0;
        const title = order.items?.template?.fullTitle;
        const orderNumber = order.orderNumber;
        const includedInInvoice = order.includedInInvoice;
        const invoiceId = order.invoiceId;
        const invoiceName = order.invoiceName;
        const selectedExtras = extraByOrderId[order.id] ?? {};
        const isChecked = !!selected[order.id] && !includedInInvoice;
        const material = order.items?.template?.material as
          | Material
          | undefined;
        const additionalOptions = getAdditionalOptions(material);

        return (
          <Fragment key={order.id}>
            <div className="border rounded-md px-4 py-3 mb-[10px] flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold">{title}</div>
                <div>
                  Цена:{' '}
                  {Number.isFinite(price)
                    ? (price / 100).toLocaleString('ru-RU')
                    : 0}
                  &nbsp;руб
                </div>
                <div>Номер №{orderNumber}</div>
                <div>Создан: {createdAt.toLocaleString('ru-RU')}</div>
                <div>
                  Согласование{' '}
                  {order.items?.approveNeeded ? 'Нужно' : 'Не нужно'}
                </div>
                {order.items?.approveNeeded && (
                  <div>
                    Согласование получено:{' '}
                    {order.items?.approved ? 'Да' : 'Нет'}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                {includedInInvoice && <p>Добавлен в счет №{invoiceName}</p>}
                {invoiceId ? (
                  <button
                    type="button"
                    onClick={() => getDownloadUrl(order.id!)}
                    className="border rounded-md px-3 py-2 bg-[#f1f1f1] mt-2 cursor-pointer"
                  >
                    Открыть счет
                  </button>
                ) : (
                  <input
                    type="checkbox"
                    className={`mt-2 h-6 w-6 accent-black ${includedInInvoice ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    checked={selected[order.id] || false}
                    disabled={includedInInvoice}
                    onChange={(e) => toggleOrder(order, e.target.checked)}
                  />
                )}
              </div>
            </div>
            {!includedInInvoice && (
              <div className="mt-2 mb-4 flex flex-col items-end gap-2">
                <div className="text-sm opacity-80">
                  Доп. услуги для этого заказа:
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded-md p-2 bg-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!isChecked}
                    value={selectValueByOrderId[order.id] ?? ''}
                    onChange={(e) =>
                      setSelectValueByOrderId((prev) => ({
                        ...prev,
                        [order.id]: e.target.value as AdditionalSku | '',
                      }))
                    }
                  >
                    <option value="">— выбрать —</option>
                    {additionalOptions.map((s) => (
                      <option key={s.skuCode} value={s.skuCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addExtra(order.id)}
                    className="border rounded-md px-3 py-2 bg-[#f1f1f1] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isChecked || !selectValueByOrderId[order.id]}
                  >
                    Добавить
                  </button>
                </div>
                {Object.keys(selectedExtras).length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {Object.entries(selectedExtras).map(([sku, qty]) => {
                      const label = getAdditionalLabel(material, sku);
                      return (
                        <div
                          key={sku}
                          className="flex items-center gap-2 border rounded-full px-3 py-1 bg-white"
                        >
                          <span className="text-sm">
                            {label} × {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeExtra(order.id, sku as AdditionalSku)
                            }
                            className="text-sm opacity-70 hover:opacity-100 cursor-pointer"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExtraByOrderId((prev) => ({
                                ...prev,
                                [order.id]: {
                                  ...(prev[order.id] ?? {}),
                                  [sku]:
                                    (prev[order.id]?.[sku as AdditionalSku] ??
                                      0) + 1,
                                },
                              }))
                            }
                            className="text-sm opacity-70 hover:opacity-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={null}>
      <InvoicePageInner />
    </Suspense>
  );
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
