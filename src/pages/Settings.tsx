import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { Settings as SettingsIcon, User, Moon, Sun, LogOut } from 'lucide-react';

export const Settings = () => {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // This would typically update the theme context
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <Input
                id="displayName"
                type="text"
                defaultValue={user?.displayName || ''}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <Button className="w-full">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              App Preferences
            </CardTitle>
            <CardDescription>
              Customize your application experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Dark Mode
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive reminders and updates
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? 'On' : 'Off'}
              </Button>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <Select defaultValue="en">
                <SelectOption value="en">English</SelectOption>
                <SelectOption value="es">Spanish</SelectOption>
                <SelectOption value="fr">French</SelectOption>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dog Management */}
      <Card>
        <CardHeader>
          <CardTitle>Dog Profiles</CardTitle>
          <CardDescription>
            Manage your dog profiles and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Dog Management Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add, edit, and manage your dog profiles will be available here.
            </p>
            <Button className="mt-4" variant="outline">
              Add New Dog
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Sign Out
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
