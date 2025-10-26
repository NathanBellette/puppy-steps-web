import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalItem } from '@/components/ui/GoalItem';
import { useDogs } from '@/context/DogContext';
import { useGoals } from '@/hooks/useGoals';
import { SessionType, SESSION_TYPE_EMOJI } from '@/types';
import { Target, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const sessionTypes: SessionType[] = ['people', 'dogs', 'environments', 'noises'];

const typeLabels: Record<SessionType, string> = {
  people: 'People',
  dogs: 'Dogs',
  environments: 'Environments',
  noises: 'Noises & Objects',
  People: 'People',
  Dogs: 'Dogs',
  Environments: 'Environments',
  Noises: 'Noises & Objects'
};

export const Goals = () => {
  const { selectedDog } = useDogs();
  const [selectedType, setSelectedType] = useState<SessionType>('people');
  const { goals, isLoading, incrementGoal, initializeGoals, isInitializing } = useGoals(selectedDog?.id);

  const filteredGoals = goals.filter(goal => goal.type === selectedType);
  const completedCount = filteredGoals.filter(g => g.isCompleted).length;
  const progressPercentage = filteredGoals.length > 0 
    ? (completedCount / filteredGoals.length) * 100 
    : 0;

  const handleInitializeGoals = async () => {
    if (selectedDog?.id) {
      try {
        await initializeGoals(selectedDog.id);
      } catch (error) {
        console.error('Failed to initialize goals:', error);
      }
    }
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
              Please select a dog to view and track their socialization goals.
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
            Goals & Milestones
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track {selectedDog.name}'s socialization progress
          </p>
        </div>
      </div>

      {/* Initialize Goals if empty */}
      {!isLoading && goals.length === 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Goals Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start tracking {selectedDog.name}'s socialization journey with 29 predefined goals across 4 categories.
                </p>
                <Button 
                  onClick={handleInitializeGoals}
                  disabled={isInitializing}
                  className="w-full sm:w-auto"
                >
                  {isInitializing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Goals...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create All Goals
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Selector (Segmented Control) */}
      {goals.length > 0 && (
        <>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
            {sessionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                  selectedType === type
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                )}
              >
                <span className="text-lg">{SESSION_TYPE_EMOJI[type]}</span>
                <span>{typeLabels[type]}</span>
              </button>
            ))}
          </div>

          {/* Progress Summary Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {typeLabels[selectedType]} Progress
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {completedCount} of {filteredGoals.length} goals completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(progressPercentage)}%
                  </div>
                </div>
              </div>
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Goals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">{SESSION_TYPE_EMOJI[selectedType]}</span>
                {typeLabels[selectedType]} Goals
              </CardTitle>
              <CardDescription>
                Tap the + button to increment progress toward each goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredGoals.length > 0 ? (
                <div className="space-y-3">
                  {filteredGoals.map((goal) => (
                    <GoalItem
                      key={goal.id}
                      goal={goal}
                      onIncrement={incrementGoal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Goals in This Category
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Goals for {typeLabels[selectedType].toLowerCase()} will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
