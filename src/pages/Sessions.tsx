import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SessionItem } from '@/components/ui/SessionItem';
import { LogSessionModal } from '@/components/LogSessionModal';
import { useDogs } from '@/hooks/useDogProfile';
import { useSessions } from '@/hooks/useSessions';
import { Plus, Calendar, Target } from 'lucide-react';

export const Sessions = () => {
  const { selectedDog } = useDogs();
  const { sessions, isLoading } = useSessions(selectedDog?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            Log and track {selectedDog.name}'s socialization sessions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            All Sessions
          </CardTitle>
          <CardDescription>
            {selectedDog.name}'s socialization activity history
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
          ) : sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No sessions logged yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start logging socialization sessions to track {selectedDog.name}'s progress.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Session
              </Button>
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
    </div>
  );
};
