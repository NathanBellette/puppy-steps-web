import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import { Goal, SessionType, SESSION_TYPE_EMOJI } from '@/types';

export interface GoalItemProps {
  goal: Goal;
  onIncrement?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  className?: string;
  showTypeEmoji?: boolean;
}

const GoalItem = ({ goal, onIncrement, onEdit, className, showTypeEmoji = false }: GoalItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isIncrementing, setIsIncrementing] = useState(false);

  const typeColors: Record<SessionType, string> = {
    people: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    dogs: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    environments: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    noises: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  const progressPercentage = goal.targetCount > 0 
    ? (goal.currentCount / goal.targetCount) * 100 
    : 0;

  const handleIncrement = async () => {
    if (onIncrement && !isIncrementing && !goal.isCompleted) {
      setIsIncrementing(true);
      try {
        await onIncrement(goal.id);
      } finally {
        setIsIncrementing(false);
      }
    }
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-3 p-4 rounded-lg border transition-all',
        goal.isCompleted 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Type Emoji (optional) */}
      {showTypeEmoji && (
        <div className="flex-shrink-0 text-2xl">
          {SESSION_TYPE_EMOJI[goal.type]}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'text-sm font-medium',
                goal.isCompleted 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-gray-900 dark:text-gray-100'
              )}>
                {goal.category}
              </h3>
              {goal.isCompleted && (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
              {goal.type}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'absolute h-full transition-all duration-300 rounded-full',
                  goal.isCompleted 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {goal.currentCount}/{goal.targetCount}
          </span>
        </div>

        {goal.completedDate && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            ✓ Completed {new Date(goal.completedDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Increment button */}
      {onIncrement && !goal.isCompleted && (
        <button
          onClick={handleIncrement}
          disabled={isIncrementing}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            'bg-blue-500 hover:bg-blue-600 text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
          aria-label="Increment goal progress"
        >
          {isIncrementing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Completed checkmark */}
      {goal.isCompleted && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Edit button (shows on hover) */}
      {onEdit && isHovered && !goal.isCompleted && (
        <button
          onClick={() => onEdit(goal.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Edit goal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export { GoalItem };
