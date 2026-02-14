import { cn } from '@/lib/utils';

interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
  emoji?: string;
}

interface SegmentedControlProps<T extends string> {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
            value === item.value
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          {item.emoji && <span className="text-lg">{item.emoji}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
