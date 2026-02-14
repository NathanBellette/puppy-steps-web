import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import { Goal, SESSION_TYPE_EMOJI, SessionType } from '@/types';
import { TargetProgress } from '@/services/targetProgress';
import { Button } from '@/components/ui/Button';

export interface GoalItemProps {
  goal: Goal;
  progress?: TargetProgress;
  onLogExposure?: (type: SessionType, category: string) => void;
  className?: string;
  showTypeEmoji?: boolean;
  /** Optional status text override (e.g. coaching tip) */
  statusText?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

const GoalItem = ({
  goal,
  progress,
  onLogExposure,
  className,
  showTypeEmoji = false,
  statusText,
}: GoalItemProps) => {
  const calmCount = progress?.calmCount ?? 0;
  const calmTarget = progress?.calmTarget ?? goal.calmTargetCount ?? goal.targetCount ?? 5;
  const varietyCount = progress?.varietyCount ?? 0;
  const varietyTarget = progress?.varietyTarget ?? goal.varietyTargetCount ?? 3;
  const isComplete = progress?.isComplete ?? false;
  const lastLogged = progress?.lastLogged ?? null;

  const calmPct = calmTarget > 0 ? Math.min((calmCount / calmTarget) * 100, 100) : 0;
  const varietyPct = varietyTarget > 0 ? Math.min((varietyCount / varietyTarget) * 100, 100) : 0;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        isComplete
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
          : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {showTypeEmoji && (
            <span className="text-xl flex-shrink-0">{SESSION_TYPE_EMOJI[goal.type]}</span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'text-sm font-semibold',
                  isComplete
                    ? 'text-emerald-900 dark:text-emerald-100'
                    : 'text-slate-900 dark:text-slate-100'
                )}
              >
                {goal.category}
              </h3>
              {isComplete && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{goal.type}</p>
          </div>
        </div>

        {/* Log Exposure button */}
        {onLogExposure && !isComplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onLogExposure(goal.type, goal.category)}
            className="flex-shrink-0 ml-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Log Exposure
          </Button>
        )}

        {/* Completed badge */}
        {isComplete && (
          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
            Complete
          </span>
        )}
      </div>

      {/* Dual progress bars */}
      <div className="space-y-2">
        {/* Calm progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-12">Calm</span>
          <div className="flex-1">
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute h-full transition-all duration-300 rounded-full',
                  isComplete ? 'bg-emerald-500' : 'bg-primary-500'
                )}
                style={{ width: `${calmPct}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap w-10 text-right">
            {calmCount}/{calmTarget}
          </span>
        </div>

        {/* Variety progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-12">Variety</span>
          <div className="flex-1">
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute h-full transition-all duration-300 rounded-full',
                  isComplete ? 'bg-emerald-500' : 'bg-accent-500'
                )}
                style={{ width: `${varietyPct}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap w-10 text-right">
            {varietyCount}/{varietyTarget}
          </span>
        </div>
      </div>

      {/* Status line */}
      <div className="mt-2">
        {statusText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">{statusText}</p>
        ) : isComplete && lastLogged ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Completed {formatTimeAgo(lastLogged)}
          </p>
        ) : lastLogged ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last logged: {formatTimeAgo(lastLogged)}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            No exposures yet. Start small.
          </p>
        )}
      </div>
    </div>
  );
};

export { GoalItem };
