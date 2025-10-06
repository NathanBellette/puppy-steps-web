import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar } from 'lucide-react';

export const Sessions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Session Log
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Log and track your dog's socialization sessions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Sessions
          </CardTitle>
          <CardDescription>
            Your dog's latest socialization activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No sessions logged yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start logging socialization sessions to track your dog's progress.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Your First Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
