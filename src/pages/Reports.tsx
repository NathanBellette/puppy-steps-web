import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, Download, FileText } from 'lucide-react';

export const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Progress Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Analyze your dog's socialization progress with detailed reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Weekly Progress
            </CardTitle>
            <CardDescription>
              Track progress over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Progress Charts Coming Soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Interactive charts will be implemented here using Recharts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Session Types
            </CardTitle>
            <CardDescription>
              Breakdown of session types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Pie Charts Coming Soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Session type distribution charts will be implemented here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>
            Key metrics and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Statistics Dashboard Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Detailed statistics and achievements will be displayed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
