import * as React from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type FrameItem = {
  id: number;
  code: string | number;
  previewUrl?: string | null;
};

export type FramePickerProps = {
  frames: FrameItem[];
  value: number | ''; // '' = без рамки
  onChange: (v: number | '') => void;
  className?: string;
  fallbackSrc?: (f: FrameItem) => string;
  noneSrc?: string;
  title?: string; // Заголовок блока, по умолчанию «Вид рамки»
};

export function FramePicker({
  frames,
  value,
  onChange,
  className,
  fallbackSrc = (f) => `/frames/${f.code}.png`,
  noneSrc,
  title = 'Вид рамки',
}: FramePickerProps) {
  const items: Array<{
    key: string;
    label: string;
    value: number | '';
    src?: string;
  }> = React.useMemo(() => {
    const list = [
      {
        key: 'none',
        label: 'Без рамки',
        value: '' as const,
        src: noneSrc,
      },
      ...frames.map((f) => ({
        key: String(f.id),
        label: `Рамка ${f.code}`,
        value: f.id,
        src: f.previewUrl ?? fallbackSrc(f),
      })),
    ];
    return list;
  }, [frames, noneSrc, fallbackSrc]);

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

function OptionCard({
  label,
  imgSrc,
  selected,
  onSelect,
}: {
  label: string;
  imgSrc?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={onSelect}
      className={cx(
        'group relative cursor-pointer select-none',
        'rounded-2xl border p-2',
        'bg-white/5 dark:bg-white/5',
        selected
          ? 'border-white/70 ring-2 ring-white/80'
          : 'border-white/10 hover:border-white/30 hover:ring-1 hover:ring-white/30',
        'transition focus:outline-none focus:ring-2 focus:ring-white/60',
      )}
    >
      <div className="overflow-hidden rounded-xl">
        <div className={cx('aspect-[3/4] w-full bg-black/10')}>
          {imgSrc ? (
            // Используем <img>, чтобы не тянуть next/image и настройки доменов
            <img
              src={imgSrc}
              alt={label}
              className="h-full w-full object-contain object-center"
              loading="lazy"
              draggable={false}
            />
          ) : (
            // Плейсхолдер, если нет картинки
            <div className="h-full w-full bg-gradient-to-b from-neutral-200 to-neutral-400 dark:from-neutral-700 dark:to-neutral-900" />
          )}
        </div>
      </div>

      <div className="mt-2 text-center text-sm">
        <span className={cx(selected ? 'text-white' : 'text-neutral-300')}>
          {label}
        </span>
      </div>

      {/* Акцентная рамка при наведении */}
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute inset-0 rounded-2xl',
          'ring-0 group-hover:ring-1 group-hover:ring-white/20',
        )}
      />
    </div>
  );
}
