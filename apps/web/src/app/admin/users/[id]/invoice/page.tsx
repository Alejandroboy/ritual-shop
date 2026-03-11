'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch, api } from '@utils';
import { CustomerOrder } from '@types';
import { Fragment, useMemo, useState } from 'react';

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();

  const { data, mutate } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  type Material =
    | 'CERMET'
    | 'WHITE_CERAMIC_GRANITE'
    | 'BLACK_CERAMIC_GRANITE'
    | 'GLASS'
    | 'GROWTH_PHOTOCERAMICS'
    | 'ENGRAVING';

  type AdditionalSku = string;

  type AdditionalOption = {
    name: string;
    skuCode: AdditionalSku;
  };

  function getAdditionalOptions(
    material?: Material | null,
  ): AdditionalOption[] {
    const common: AdditionalOption[] = [
      {
        name: 'Дополнительный фон на трафарете',
        skuCode: '20174',
      },
      {
        name: 'Оцветнение фотографии',
        skuCode: '20172',
      },
      {
        name: 'Согласование',
        skuCode: '20168',
      },
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
        {
          name: 'Ретушь (керамогранит)',
          skuCode: '20181',
        },
        {
          name: 'Ретушь с другой фотографии (керамогранит)',
          skuCode: '20178',
        },
        {
          name: 'Сверление отверстий (керамогранит)',
          skuCode: '20169',
        },
      ];
    }

    if (material === 'GLASS') {
      return [
        ...common,
        {
          name: 'Дополнительный человек на трафарете (стекло)',
          skuCode: '20176',
        },
        {
          name: 'Ретушь (стекло)',
          skuCode: '20182',
        },
        {
          name: 'Ретушь с другой фотографии (стекло)',
          skuCode: '20179',
        },
        {
          name: 'Сверление отверстий (стекло)',
          skuCode: '20185',
        },
      ];
    }

    if (material === 'ENGRAVING') {
      return [
        ...common,
        {
          name: 'Дополнительный человек на трафарете (гравировка)',
          skuCode: '20177',
        },
        {
          name: 'Ретушь (гравировка)',
          skuCode: '20183',
        },
        {
          name: 'Ретушь с другой фотографии (гравировка)',
          skuCode: '20180',
        },
        {
          name: 'Сверление отверстий (гравировка)',
          skuCode: '20186',
        },
      ];
    }

    if (material === 'CERMET') {
      return [
        ...common,
        {
          name: 'Дополнительный человек на трафарете (металлокерамика)',
          skuCode: '20173',
        },
        {
          name: 'Ретушь (металлокерамика)',
          skuCode: '20184',
        },
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
  const orders: CustomerOrder[] = user?.customerOrders ?? [];

  const counterpartyId =
    user?.kontragentId ?? user?.moyskladCounterpartyId ?? null; // подстрой под реальное поле

  const toggleOrder = (order: CustomerOrder, checked: boolean) => {
    const orderId = order.id;
    console.log('order', order);

    const sku = order.items.skuCode as string | undefined;

    const price = (order.items as any).template?.allowedSizes?.find(
      (x: any) => x.sizeId === (order.items as any).sizeId,
    )?.price as number | undefined;

    if (!sku || price == null) return;

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
      const currentQty = cur[sku] ?? 0;

      return {
        ...prev,
        [orderId]: {
          ...cur,
          [sku]: currentQty + 1, // увеличиваем
        },
      };
    });

    setSelectValueByOrderId((prev) => ({ ...prev, [orderId]: '' }));
  }

  function removeExtra(orderId: string, sku: AdditionalSku) {
    setExtraByOrderId((prev) => {
      const cur = prev[orderId] ?? {};
      const currentQty = cur[sku] ?? 0;

      if (currentQty <= 1) {
        const { [sku]: _, ...rest } = cur;

        const out = { ...prev, [orderId]: rest };
        if (Object.keys(rest).length === 0) delete out[orderId];
        return out;
      }

      return {
        ...prev,
        [orderId]: {
          ...cur,
          [sku]: currentQty - 1,
        },
      };
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
  }, [ordersIds, extraByOrderId]);

  async function getDownloadUrl(orderId: string) {
    const templateId = '6f3c9a47-6772-4944-9723-92d0d7be2a9c';
    try {
      const res = await api<{ url: string }>(
        `/moy-sklad/orders/${orderId}/invoice-publication-url?templateId=${templateId}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
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

  // const aggregatedPositions = useMemo(() => {
  //   const map = new Map<
  //     string,
  //     { sku: string; qty: number; priceMinor: number }
  //   >();
  //
  //   for (const p of positions) {
  //     const cur = map.get(p.sku);
  //     if (!cur)
  //       map.set(p.sku, { sku: p.sku, qty: 1, priceMinor: p.priceMinor });
  //     else cur.qty += 1;
  //   }
  //
  //   return Array.from(map.values());
  // }, [positions]);

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
    const orderNumberById = new Map(
      orders.map((o: any) => [o.id, o.orderNumber ?? o.id]),
    );
    const selectedOrderNumbers = ordersIds
      .map((oid) => orderNumberById.get(oid) ?? oid)
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

      console.log('invoiceout created:', json);
      alert(
        `Счёт создан: ${(json as any)?.name ?? (json as any)?.number ?? (json as any)?.id ?? ''}`,
      );

      await mutate();
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

  if (!orders.length) return null;

  return (
    <div data-qa="InvoicePage">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={createInvoice}
          disabled={busy || ordersIds.length === 0}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Создаю…' : `Создать счёт (${ordersIds.length})`}
        </button>

        {/*<div className="text-sm opacity-70">*/}
        {/*  Контрагент: {counterpartyId ?? 'не задан'}*/}
        {/*</div>*/}
      </div>

      {orders.map((order: CustomerOrder) => {
        const createdAt = new Date(order.createdAt);

        const price = order.items?.template?.allowedSizes?.find(
          (x: any) => x.sizeId === order.items.sizeId,
        )?.price;

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
            <div
              key={order.id}
              className="border rounded-md px-4 py-3 mb-[10px] flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-semibold">{title}</div>
                <div>Цена: {price}</div>
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
                    className={`mt-2 h-6 w-6 accent-black ${includedInInvoice ? 'cursor-not-allowed' : 'cursor-pointer'} `}
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
                    className={`border rounded-md p-2 bg-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed`}
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
                            onClick={() => {
                              setExtraByOrderId((prev) => ({
                                ...prev,
                                [order.id]: {
                                  ...(prev[order.id] ?? {}),
                                  [sku]:
                                    (prev[order.id]?.[sku as AdditionalSku] ??
                                      0) + 1,
                                },
                              }));
                            }}
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

      {/*<pre className="mt-4 text-xs whitespace-pre-wrap">*/}
      {/*  {JSON.stringify(*/}
      {/*    {*/}
      {/*      ordersIds,*/}
      {/*      positions,*/}
      {/*      extraByOrderId,*/}
      {/*      extraPositions,*/}
      {/*    },*/}
      {/*    null,*/}
      {/*    2,*/}
      {/*  )}*/}
      {/*</pre>*/}
    </div>
  );
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
