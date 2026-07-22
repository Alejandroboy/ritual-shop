import { CustomerOrderItem } from '@types';

export type Material =
  | 'CERMET'
  | 'WHITE_CERAMIC_GRANITE'
  | 'BLACK_CERAMIC_GRANITE'
  | 'GLASS'
  | 'GROWTH_PHOTOCERAMICS'
  | 'ENGRAVING';

export type AdditionalSku = string;
export type AdditionalOption = { name: string; skuCode: AdditionalSku };

export function getAdditionalOptions(
  material?: Material | null,
): AdditionalOption[] {
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

export function getAdditionalLabel(
  material: Material | null | undefined,
  sku: string,
): string {
  return (
    getAdditionalOptions(material).find((x) => x.skuCode === sku)?.name ?? sku
  );
}

export function getApprovalOption(): AdditionalOption | undefined {
  return getAdditionalOptions(null).find((o) => o.name === 'Согласование');
}

export function getRetouchOption(
  material?: Material | null,
): AdditionalOption | undefined {
  return getAdditionalOptions(material).find((o) =>
    o.name.startsWith('Ретушь ('),
  );
}

export function findItemPricingEntry(
  item: CustomerOrderItem | null | undefined,
): { price: number; skuCode: string | null } | undefined {
  if (!item) return undefined;
  if (item.template?.requiresFinish && item.template?.finishPrices.length) {
    return item.template.finishPrices.find(
      (x) => x.sizeId === item.sizeId && x.finish === item.finish,
    );
  }
  return item.template?.allowedSizes?.find((x) => x.sizeId === item.sizeId);
}

export function getItemPrice(
  item: CustomerOrderItem | null | undefined,
): number | undefined {
  return findItemPricingEntry(item)?.price;
}

export function getItemSku(
  item: CustomerOrderItem | null | undefined,
): string | undefined {
  return item?.skuCode || findItemPricingEntry(item)?.skuCode || undefined;
}

export function getHoleCount(holePattern?: string | null): number {
  if (!holePattern) return 0;
  if (holePattern.startsWith('TWO')) return 2;
  if (holePattern.startsWith('FOUR')) return 4;
  return 0;
}

export function getHolePrice(
  item: CustomerOrderItem | null | undefined,
): number {
  const perHolePrice = item?.template?.perHolePrice ?? 0;
  console.log('item?.template', item?.template);
  console.log(
    'getHoleCount(item?.holePattern)',
    getHoleCount(item?.holePattern),
  );
  return perHolePrice * getHoleCount(item?.holePattern);
}

export const formatMinor = (minor?: number | null) =>
  typeof minor === 'number'
    ? `${(minor / 100).toLocaleString('ru-RU')} руб`
    : null;
