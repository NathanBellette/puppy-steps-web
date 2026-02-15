import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SessionItem } from '@/components/ui/SessionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { LogSessionModal } from '@/components/LogSessionModal';
import { useDogs } from '@/hooks/useDogProfile';
import { useSessions } from '@/hooks/useSessions';
import { useToast } from '@/context/ToastContext';
import { SessionType, SESSION_TYPE_EMOJI } from '@/types';
import { Plus, Calendar, Target } from 'lucide-react';

const TYPE_FILTERS = [
  { label: 'All', value: 'all' as const, emoji: '📋' },
  { label: 'People', value: 'people' as const, emoji: SESSION_TYPE_EMOJI.people },
  { label: 'Dogs', value: 'dogs' as const, emoji: SESSION_TYPE_EMOJI.dogs },
  { label: 'Environments', value: 'environments' as const, emoji: SESSION_TYPE_EMOJI.environments },
  { label: 'Noises', value: 'noises' as const, emoji: SESSION_TYPE_EMOJI.noises },
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
            <EmptyState
              icon={Target}
              title="No Dog Selected"
              description="Please select a dog to view and log their socialization sessions."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Session Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Log and track {selectedDog.name}'s socialisation sessions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Session
        </Button>
      </div>

      {/* Type Filter */}
      <SegmentedControl
        items={TYPE_FILTERS}
        value={typeFilter}
        onChange={setTypeFilter}
      />

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
            <SkeletonList count={5} />
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
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                {typeFilter === 'all' ? 'No sessions logged yet' : `No ${typeFilter} sessions yet`}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
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
          <p className="text-slate-600 dark:text-slate-400">
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
