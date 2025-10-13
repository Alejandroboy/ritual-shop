import { api, type TemplateDetails } from '../../../../api';
import AddToOrderForm from '../../../components/add-to-order-form';
import React from 'react';

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const tpl = await api<TemplateDetails>(
    `/catalog/templates/${encodeURIComponent((await params).code)}`,
  );
  return (
    <div className="space-y-6" data-qa="template-page">
      <div>
        <div className="text-sm text-neutral-500">{tpl.code}</div>
        <h1 className="text-2xl font-semibold">{tpl.label}</h1>
        <div className="text-sm text-neutral-600">
          {tpl.material} · {tpl.shape}
          {tpl.orientation ? ` · ${tpl.orientation}` : ''} · {tpl.colorMode}
          {tpl.coverage === 'FULL_WRAP' ? ' · полная затяжка' : ''}
        </div>
      </div>

      <AddToOrderForm tpl={tpl} />

      <div className="flex justify-between">
        <div>Итоговая цена:</div>
        <div>{tpl.basePriceMinor}</div>
      </div>
      <section className="text-sm text-neutral-700">
        <h2 className="font-medium mb-2">Доступные опции</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Размеры: {tpl.sizes.map((s) => s.label).join(', ') || '—'}</li>
          <li>Отверстия: {tpl.holes.join(', ') || '—'}</li>
          {tpl.supportsFrame && (
            <li>Рамки: {tpl.frames.map((f) => f.code).join(', ') || '—'}</li>
          )}
          {tpl.requiresBackground && (
            <li>
              Фоны: {tpl.backgrounds.map((b) => b.code).join(', ') || '—'}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
