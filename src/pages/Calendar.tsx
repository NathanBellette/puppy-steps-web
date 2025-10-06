import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar as CalendarIcon } from 'lucide-react';

export const Calendar = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Calendar View
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          View your dog's socialization sessions on a calendar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Session Calendar
          </CardTitle>
          <CardDescription>
            Track sessions and progress over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Calendar View Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Interactive calendar with session highlighting will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
