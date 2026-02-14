import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SessionItem } from '@/components/ui/SessionItem';
import { LogSessionModal } from '@/components/LogSessionModal';
import { useDogs } from '@/hooks/useDogProfile';
import { useSessions } from '@/hooks/useSessions';
import { useToast } from '@/context/ToastContext';
import { SessionType, SESSION_TYPE_EMOJI } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Calendar, Target } from 'lucide-react';

const TYPE_FILTERS: Array<{ label: string; value: SessionType | 'all'; emoji: string }> = [
  { label: 'All', value: 'all', emoji: '📋' },
  { label: 'People', value: 'people', emoji: SESSION_TYPE_EMOJI.people },
  { label: 'Dogs', value: 'dogs', emoji: SESSION_TYPE_EMOJI.dogs },
  { label: 'Environments', value: 'environments', emoji: SESSION_TYPE_EMOJI.environments },
  { label: 'Noises', value: 'noises', emoji: SESSION_TYPE_EMOJI.noises },
];

export const Sessions = () => {
  const { selectedDog } = useDogs();
  const { sessions, isLoading, deleteSession, isDeleting } = useSessions(selectedDog?.id);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    if (typeFilter === 'all') return sessions;
    return sessions.filter(s => s.type === typeFilter);
  }, [sessions, typeFilter]);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteSession(deleteConfirmId);
      showToast('Session deleted', 'success');
    } catch {
      showToast('Failed to delete session', 'error');
    }
    setDeleteConfirmId(null);
  };

  if (!selectedDog) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Dog Selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Please select a dog to view and log their socialization sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Session Log
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Log and track {selectedDog.name}'s socialisation sessions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Session
        </Button>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setTypeFilter(filter.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              typeFilter === filter.value
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <span className="text-lg">{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {typeFilter === 'all' ? 'All Sessions' : `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} Sessions`}
          </CardTitle>
          <CardDescription>
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
            {typeFilter !== 'all' && ` (filtered)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {typeFilter === 'all' ? 'No sessions logged yet' : `No ${typeFilter} sessions yet`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {typeFilter === 'all'
                  ? `Start logging socialisation sessions to track ${selectedDog.name}'s progress.`
                  : `Try logging a ${typeFilter} session or change the filter.`}
              </p>
              {typeFilter === 'all' && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Session
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dogId={selectedDog.id}
        dogName={selectedDog.name}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Session"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this session? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
