'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Material, Shape, Orientation, ColorMode } from '@types';

const MATERIALS: Material[] = [
  'CERMET',
  'WHITE_CERAMIC_GRANITE',
  'BLACK_CERAMIC_GRANITE',
  'GLASS',
  'GROWTH_PHOTOCERAMICS',
  'ENGRAVING',
];
const SHAPES: Shape[] = ['RECTANGLE', 'OVAL', 'ARCH'];
const ORIENTS: Orientation[] = ['VERTICAL', 'HORIZONTAL'];
const COLORS: ColorMode[] = ['BW', 'COLOR'];

export default function FilterBar() {
  const sp = useSearchParams();
  const r = useRouter();

  const [material, setMaterial] = useState<string>(sp.get('material') || '');
  const [shape, setShape] = useState<string>(sp.get('shape') || '');
  const [orientation, setOrientation] = useState<string>(
    sp.get('orientation') || '',
  );
  const [colorMode, setColorMode] = useState<string>(sp.get('colorMode') || '');

  useEffect(() => {
    setMaterial(sp.get('material') || '');
    setShape(sp.get('shape') || '');
    setOrientation(sp.get('orientation') || '');
    setColorMode(sp.get('colorMode') || '');
  }, [sp]);

  const apply = () => {
    const q = new URLSearchParams();
    if (material) q.set('material', material);
    if (shape) q.set('shape', shape);
    if (orientation) q.set('orientation', orientation);
    if (colorMode) q.set('colorMode', colorMode);
    q.set('page', '1');
    q.set('pageSize', '24');
    r.push(`/catalog?${q.toString()}`);
  };

  const reset = () => r.push('/catalog');

  const select = (
    label: string,
    value: string,
    setter: (v: string) => void,
    list: string[],
  ) => (
    <label className="text-sm">
      <span className="block mb-1 text-neutral-600">{label}</span>
      <select
        className="border rounded-md px-2 py-1 bg-white"
        value={value}
        onChange={(e) => setter(e.target.value)}
      >
        <option value="">—</option>
        {list.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-4 items-end">
      {select('Материал', material, setMaterial, MATERIALS)}
      {select('Форма', shape, setShape, SHAPES)}
      {select('Ориентация', orientation, setOrientation, ORIENTS)}
      {select('Цветность', colorMode, setColorMode, COLORS)}
      <div className="ml-auto flex gap-2">
        <button
          onClick={apply}
          className="px-3 py-1.5 rounded-md bg-neutral-900 text-white"
        >
          Фильтр
        </button>
        <button onClick={reset} className="px-3 py-1.5 rounded-md border">
          Сброс
        </button>
      </div>
    </div>
  );
}
