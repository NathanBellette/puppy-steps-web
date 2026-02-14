import { cn, formatDateTime, getReactionEmoji, getReactionLabel, capitalizeFirst } from '@/lib/utils';
import { Session, SessionType } from '@/types';
import { Calendar, MapPin, Users, Volume2, Edit, Trash2 } from 'lucide-react';

export interface SessionItemProps {
  session: Session;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  className?: string;
}

const SessionItem = ({ session, onEdit, onDelete, className }: SessionItemProps) => {
  const getSessionTypeIcon = (type: SessionType) => {
    switch (type) {
      case 'people':
        return <Users className="w-4 h-4" />;
      case 'dogs':
        return <Users className="w-4 h-4" />;
      case 'environments':
        return <MapPin className="w-4 h-4" />;
      case 'noises':
        return <Volume2 className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case 'people':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'dogs':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'environments':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'noises':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case '😰':
        return 'text-red-500';
      case '😟':
        return 'text-orange-500';
      case '😐':
        return 'text-gray-500';
      case '😊':
        return 'text-green-500';
      case '😍':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-4 p-4 rounded-lg border bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700',
        className
      )}
    >
      {/* Session Type Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
        getSessionTypeColor(session.type)
      )}>
        {getSessionTypeIcon(session.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getSessionTypeColor(session.type)
            )}>
              {getSessionTypeIcon(session.type)}
              <span className="ml-1">{capitalizeFirst(session.type)}</span>
            </span>
            {session.category && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                • {session.category}
              </span>
            )}
            <span className={cn('text-2xl', getReactionColor(session.reaction))}>
              {getReactionEmoji(session.reaction)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getReactionLabel(session.reaction)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(session.id)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Edit session"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(session.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Delete session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDateTime(session.date)}
        </div>

        {session.notes && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {session.notes}
          </p>
        )}

        {session.photoUrl && (
          <div className="mt-3">
            <img
              src={session.photoUrl}
              alt="Session photo"
              className="w-full max-w-xs h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { SessionItem };
