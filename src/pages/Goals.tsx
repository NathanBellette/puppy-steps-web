import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalItem } from '@/components/ui/GoalItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { NoDogSelected } from '@/components/NoDogSelected';
import { PageHeader } from '@/components/layout/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Spinner } from '@/components/ui/Spinner';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { useDogs } from '@/hooks/useDogProfile';
import { useGoals } from '@/hooks/useGoals';
import { useTargetProgress } from '@/hooks/useTargetProgress';
import { SessionType, SESSION_TYPES, SESSION_TYPE_EMOJI } from '@/types';
import { getCoachingTip } from '@/services/targetProgress';
import { Target, AlertCircle, Plus } from 'lucide-react';

const typeLabels: Record<SessionType, string> = {
  people: 'People',
  dogs: 'Dogs',
  environments: 'Environments',
  noises: 'Noises & Objects',
};

const segmentItems = SESSION_TYPES.map(type => ({
  value: type,
  label: typeLabels[type],
  emoji: SESSION_TYPE_EMOJI[type],
}));

export const Goals = () => {
  const navigate = useNavigate();
  const { selectedDog } = useDogs();
  const [selectedType, setSelectedType] = useState<SessionType>('people');
  const { goals, isLoading, initializeGoals, isInitializing } = useGoals(selectedDog?.id);
  const { progress, categoryProgress } = useTargetProgress(selectedDog?.id);

  const filteredGoals = goals.filter(goal => goal.type === selectedType);
  const catProgress = categoryProgress[selectedType];
  const completedCount = catProgress?.completed ?? 0;
  const totalCount = catProgress?.total ?? filteredGoals.length;
  const progressPercentage = catProgress?.percentage ?? 0;

  const handleLogExposure = (type: SessionType, category: string) => {
    navigate('/log-exposure', {
      state: {
        prefillType: type,
        prefillCategory: category,
      },
    });
  };

  const handleInitializeGoals = async () => {
    if (selectedDog?.id) {
      try {
        await initializeGoals(selectedDog.id);
      } catch {
        // Error is handled by React Query mutation state
      }
    }
  };

  if (!selectedDog) {
    return <NoDogSelected description="Please select a dog to view and track their socialisation targets." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Plan" description={`Track ${selectedDog.name}'s socialisation targets`} />

      {/* Initialize Goals if empty */}
      {!isLoading && goals.length === 0 && (
        <Card className="border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No Targets Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Start tracking {selectedDog.name}'s socialisation journey with 29 predefined targets across 4 categories.
                </p>
                <Button
                  onClick={handleInitializeGoals}
                  disabled={isInitializing}
                  className="w-full sm:w-auto"
                >
                  {isInitializing ? (
                    <>
                      <Spinner size="sm" className="text-white mr-2" />
                      Creating Targets...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create All Targets
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
          <SegmentedControl
            items={segmentItems}
            value={selectedType}
            onChange={setSelectedType}
          />

          {/* Progress Summary Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {typeLabels[selectedType]} Progress
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {completedCount} of {totalCount} targets complete
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {progressPercentage}%
                  </div>
                </div>
              </div>
              <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
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
                {typeLabels[selectedType]} Targets
              </CardTitle>
              <CardDescription>
                Log exposures to build calm, confident habits across different contexts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonList count={5} rowHeight="h-24" />
              ) : filteredGoals.length > 0 ? (
                <div className="space-y-3">
                  {filteredGoals.map((goal) => {
                    const goalProgress = progress[goal.id];
                    return (
                      <GoalItem
                        key={goal.id}
                        goal={goal}
                        progress={goalProgress}
                        onLogExposure={handleLogExposure}
                        statusText={goalProgress ? getCoachingTip(goalProgress) : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Target}
                  title="No Targets in This Category"
                  description={`Targets for ${typeLabels[selectedType].toLowerCase()} will appear here.`}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
