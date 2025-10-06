import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Target } from 'lucide-react';

export const Goals = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Goals & Milestones
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your dog's socialization progress with structured goals
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              People
            </CardTitle>
            <CardDescription>
              Goals related to human interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Goals for people socialization will be displayed here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Dogs
            </CardTitle>
            <CardDescription>
              Goals related to dog-to-dog interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Goals for dog socialization will be displayed here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Environments
            </CardTitle>
            <CardDescription>
              Goals related to new environments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Goals for environment socialization will be displayed here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Noises & Objects
            </CardTitle>
            <CardDescription>
              Goals related to sounds and objects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Goals for noise and object socialization will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
