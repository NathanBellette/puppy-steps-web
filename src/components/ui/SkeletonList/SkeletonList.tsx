interface SkeletonListProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Height class for each skeleton item (e.g. "h-20", "h-24") */
  height?: string;
}

const SkeletonList = ({ count = 3, height = 'h-20' }: SkeletonListProps) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className={`${height} bg-slate-200 dark:bg-slate-700 rounded-lg`} />
      </div>
    ))}
  </div>
);

export { SkeletonList };
