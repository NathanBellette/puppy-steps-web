import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { Goal, GoalCategory } from '@/types';

export interface GoalItemProps {
  goal: Goal;
  onToggle: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  className?: string;
}

const GoalItem = ({ goal, onToggle, onEdit, className }: GoalItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const categoryColors = {
    people: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    dogs: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    environments: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    noises: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  const getCategoryLabel = (category: GoalCategory) => {
    switch (category) {
      case 'people':
        return 'People';
      case 'dogs':
        return 'Dogs';
      case 'environments':
        return 'Environments';
      case 'noises':
        return 'Noises/Objects';
      default:
        return category;
    }
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border transition-colors',
        goal.isCompleted 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(goal.id)}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
          goal.isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-primary-500 dark:border-gray-600'
        )}
        aria-label={goal.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {goal.isCompleted && (
          <Check className="w-4 h-4" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            'text-sm font-medium',
            goal.isCompleted 
              ? 'text-green-900 line-through dark:text-green-100' 
              : 'text-gray-900 dark:text-gray-100'
          )}>
            {goal.title}
          </h3>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            categoryColors[goal.category]
          )}>
            {getCategoryLabel(goal.category)}
          </span>
        </div>
        
        {goal.description && (
          <p className={cn(
            'mt-1 text-sm',
            goal.isCompleted 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-gray-600 dark:text-gray-400'
          )}>
            {goal.description}
          </p>
        )}

        {goal.completedAt && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            Completed {goal.completedAt.toLocaleDateString()}
          </p>
        )}
      </div>

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
