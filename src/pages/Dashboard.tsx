import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { DogAvatar } from '@/components/ui/DogAvatar';
import { GoalItem } from '@/components/ui/GoalItem';
import { SessionItem } from '@/components/ui/SessionItem';
import { AddDogModal } from '@/components/AddDogModal';
import { useDogs } from '@/hooks/useDogProfile';
import { useGoalStats, useGoals } from '@/hooks/useGoals';
import { useSessionStats, useSessions } from '@/hooks/useSessions';
import { Target, Calendar, TrendingUp, Award, Plus } from 'lucide-react';
import { LogSessionModal } from "@/components/LogSessionModal";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedDog } = useDogs();
  const [showAddDogModal, setShowAddDogModal] = useState<boolean>(false);
  const [showLogSessionModal, setShowLogSessionModal] = useState<boolean>(false);
  const { stats: goalStats, isLoading: goalsLoading } = useGoalStats(selectedDog?.id);
  const { goals, incrementGoal } = useGoals(selectedDog?.id);
  const { stats: sessionStats, isLoading: sessionsLoading } = useSessionStats(selectedDog?.id);
  const { sessions } = useSessions(selectedDog?.id);

  const nextGoals = goals.filter(goal => !goal.isCompleted).slice(0, 5);
  const recentSessions = sessions.slice(0, 3);

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
              Please add a dog profile to start tracking their socialization progress.
            </p>
            <Button onClick={() => setShowAddDogModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Dog Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallProgress = goalStats.totalGoals > 0 
    ? (goalStats.completedGoals / goalStats.totalGoals) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Log Session Modal */}
      <LogSessionModal
          isOpen={showLogSessionModal}
          onClose={() => setShowLogSessionModal(false)}
          dogId={selectedDog.id}
          dogName={selectedDog.name}
      />
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <DogAvatar
            name={selectedDog.name}
            photoUrl={selectedDog.photoUrl}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedDog.name}'s Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedDog.breed} • {selectedDog.age} months old
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(overallProgress)}%
                </p>
              </div>
              <CircularProgress 
                value={overallProgress} 
                size={60}
                strokeWidth={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals Completed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Goals Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {goalStats.completedGoals}/{goalStats.totalGoals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Logged */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sessions Logged
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {sessionStats.totalSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Reaction */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Reaction
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {sessionStats.averageReaction.toFixed(1)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Next Goals
            </CardTitle>
            <CardDescription>
              Focus on these socialisation goals next
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goalsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : nextGoals.length > 0 ? (
              <div className="space-y-3">
                {nextGoals.map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onIncrement={incrementGoal}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  All goals completed!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Great job! Visit the Goals page to review your progress.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/goals')}>
                  <Target className="h-4 w-4 mr-2" />
                  View Goals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Sessions
            </CardTitle>
            <CardDescription>
              Latest socialization sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                  />
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate('/sessions')}>
                  View All Sessions
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No sessions yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start logging socialization sessions to track progress.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => setShowLogSessionModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log First Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
          <CardDescription>
            Track progress across different socialization areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(goalStats.categoryProgress).map(([category, progress]) => (
              <div key={category} className="text-center">
                <div className="mb-2">
                  <CircularProgress 
                    value={progress.percentage} 
                    size={80}
                    strokeWidth={4}
                  />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {category}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {progress.completed}/{progress.total} goals
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Dog Modal */}
      <AddDogModal
        isOpen={showAddDogModal}
        onClose={() => setShowAddDogModal(false)}
      />
    </div>
  );
};
