import * as React from 'react';

export type BackgroundItem = {
  id: number;
  code: string | number;
  previewUrl?: string | null;
};

export function BackgroundPicker({
  backgrounds,
  value,
  onChange,
  className,
  fallbackSrc = (b: BackgroundItem) => `/background-${b.code}.jpg`,
  noneSrc = '/background-none.jpg',
  title = 'Вид фона',
}: {
  backgrounds: BackgroundItem[];
  value: number | '';
  onChange: (v: number | '') => void;
  className?: string;
  fallbackSrc?: (b: BackgroundItem) => string;
  noneSrc?: string;
  title?: string;
}) {
  const items: Array<{
    key: string;
    label: string;
    value: number | '';
    src?: string;
  }> = React.useMemo(() => {
    const list = [
      {
        key: 'none',
        label: 'Без фона',
        value: '' as const,
        src: noneSrc,
      },
      ...backgrounds.map((b) => ({
        key: String(b.id),
        label: `Фон ${b.code}`,
        value: b.id,
        src: b.previewUrl ?? fallbackSrc(b),
      })),
    ];
    return list;
  }, [backgrounds, noneSrc, fallbackSrc]);

  return (
    <fieldset className={cx('w-full', className)}>
      <legend className="mb-2 text-sm text-neutral-400">{title}</legend>

      <div
        role="radiogroup"
        aria-label={title}
        className={cx(
          'grid gap-4',
          'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
        )}
      >
        {items.map((it) => (
          <OptionCard
            key={it.key}
            label={it.label}
            imgSrc={it.src}
            selected={value === it.value}
            onSelect={() => onChange(it.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
