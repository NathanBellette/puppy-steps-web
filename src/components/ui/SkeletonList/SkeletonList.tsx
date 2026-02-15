interface SkeletonListProps {
  /** Number of skeleton rows to render. Defaults to 3. */
  count?: number;
  /** Height class for each skeleton row. Defaults to 'h-20'. */
  rowHeight?: string;
}

export const SkeletonList = ({ count = 3, rowHeight = 'h-20' }: SkeletonListProps) => (
  <div className="space-y-3">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="animate-pulse">
        <div className={`${rowHeight} bg-slate-200 dark:bg-slate-700 rounded-lg`} />
      </div>
    ))}
  </div>
);
