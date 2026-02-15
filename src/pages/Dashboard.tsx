import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { DogAvatar } from '@/components/ui/DogAvatar';
import { GoalItem } from '@/components/ui/GoalItem';
import { SessionItem } from '@/components/ui/SessionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { AddDogModal } from '@/components/AddDogModal';
import { useDogs } from '@/hooks/useDogProfile';
import { useGoals } from '@/hooks/useGoals';
import { useTargetProgress } from '@/hooks/useTargetProgress';
import { useSessionStats, useSessions } from '@/hooks/useSessions';
import { getCoachingTip } from '@/services/targetProgress';
import { SessionType, SESSION_TYPE_EMOJI } from '@/types';
import { Target, Calendar, TrendingUp, Plus } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedDog } = useDogs();
  const [showAddDogModal, setShowAddDogModal] = useState(false);

  const { goals } = useGoals(selectedDog?.id);
  const {
    progress,
    categoryProgress,
    totalTargets,
    completedTargets,
    overallPercentage,
    isLoading: progressLoading,
  } = useTargetProgress(selectedDog?.id);
  const { stats: sessionStats, isLoading: sessionsLoading } = useSessionStats(selectedDog?.id);
  const { sessions } = useSessions(selectedDog?.id);

  const recentSessions = sessions.slice(0, 3);

  // Pick the 3 incomplete targets with the least progress for "Today's Plan"
  const todaysPlan = useMemo(() => {
    if (!goals.length || !Object.keys(progress).length) return [];

    const incomplete = goals
      .filter((g) => {
        const p = progress[g.id];
        return p && !p.isComplete;
      })
      .map((g) => ({ goal: g, progress: progress[g.id] }));

    // Sort by total progress ascending (worst progress first)
    incomplete.sort((a, b) => {
      const aScore =
        (a.progress.calmCount / a.progress.calmTarget +
          a.progress.varietyCount / a.progress.varietyTarget) /
        2;
      const bScore =
        (b.progress.calmCount / b.progress.calmTarget +
          b.progress.varietyCount / b.progress.varietyTarget) /
        2;
      return aScore - bScore;
    });

    return incomplete.slice(0, 3);
  }, [goals, progress]);

  // Weekly calm exposures (last 7 days)
  const weeklyCalmCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessions.filter(
      (s) =>
        new Date(s.date) >= weekAgo &&
        (s.reaction === '😐' || s.reaction === '😊' || s.reaction === '😍')
    ).length;
  }, [sessions]);

  const handleLogExposure = (type?: SessionType, category?: string) => {
    navigate('/log-exposure', {
      state: {
        prefillType: type,
        prefillCategory: category,
      },
    });
  };

  if (!selectedDog) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <EmptyState
              icon={Target}
              title="No Dog Selected"
              description="Please add a dog profile to start tracking their socialization progress."
              actionLabel="Add Dog Profile"
              onAction={() => setShowAddDogModal(true)}
            />
          </CardContent>
        </Card>
        <AddDogModal isOpen={showAddDogModal} onClose={() => setShowAddDogModal(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <DogAvatar name={selectedDog.name} photoUrl={selectedDog.photoUrl} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selectedDog.name}'s Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {selectedDog.breed} &middot; {selectedDog.age} months old
            </p>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <Button
        onClick={() => handleLogExposure()}
        className="w-full py-4 text-lg font-semibold"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Log Exposure
      </Button>

      {/* Today's Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Today's Plan
          </CardTitle>
          <CardDescription>
            {todaysPlan.length > 0
              ? `${todaysPlan.length} suggested exposure${todaysPlan.length !== 1 ? 's' : ''} for today`
              : 'All targets are on track!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <SkeletonList count={3} rowHeight="h-24" />
          ) : todaysPlan.length > 0 ? (
            <div className="space-y-3">
              {todaysPlan.map(({ goal, progress: tp }) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  progress={tp}
                  showTypeEmoji
                  onLogExposure={(type, cat) => handleLogExposure(type, cat)}
                  statusText={getCoachingTip(tp)}
                />
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/goals')}
              >
                <Target className="h-4 w-4 mr-2" />
                View All Targets
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                Great progress!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                All targets are on track. Keep it up!
              </p>
              <Button className="mt-4" variant="outline" onClick={() => navigate('/goals')}>
                <Target className="h-4 w-4 mr-2" />
                View Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Targets
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {overallPercentage}%
                </p>
              </div>
              <CircularProgress value={overallPercentage} size={48} strokeWidth={5} />
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">This Week</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {weeklyCalmCount} calm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Completed
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {completedTargets}/{totalTargets}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Reaction */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Reaction</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {sessionStats.averageReaction.toFixed(1)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
          <CardDescription>
            Track progress across different socialisation areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(categoryProgress) as [SessionType, { total: number; completed: number; percentage: number }][]).map(
              ([type, cat]) => (
                <div key={type} className="text-center">
                  <div className="mb-2">
                    <CircularProgress value={cat.percentage} size={64} strokeWidth={4} />
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize text-sm">
                    {SESSION_TYPE_EMOJI[type]} {type}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cat.completed}/{cat.total} targets
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Sessions
          </CardTitle>
          <CardDescription>Latest socialisation sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <SkeletonList count={3} />
          ) : recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
              <Button variant="outline" className="w-full" onClick={() => navigate('/sessions')}>
                View All Sessions
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No sessions yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Start logging socialization sessions to track progress.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => handleLogExposure()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log First Exposure
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dog Modal */}
      <AddDogModal isOpen={showAddDogModal} onClose={() => setShowAddDogModal(false)} />
    </div>
  );
};
