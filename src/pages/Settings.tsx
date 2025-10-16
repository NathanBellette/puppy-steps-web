import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DogAvatar } from '@/components/ui/DogAvatar';
import { Modal } from '@/components/ui/Modal';
import { AddDogModal } from '@/components/AddDogModal';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Bell, 
  Shield, 
  Info, 
  Mail, 
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react';

export const Settings = () => {
  const { user, signOut } = useAuth();
  const { dogs } = useDogs();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dogToDelete, setDogToDelete] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleDeleteDog = (dogId: string) => {
    setDogToDelete(dogId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDog = async () => {
    if (dogToDelete) {
      // TODO: Implement dog deletion
      console.log('Delete dog:', dogToDelete);
      setShowDeleteConfirm(false);
      setDogToDelete(null);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <User className="h-10 w-10 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full p-2" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user?.email || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Signed in
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Dogs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Dogs</CardTitle>
              <CardDescription>
                Manage your dog profiles
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddDogModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Dog
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dogs.length > 0 ? (
            <div className="space-y-3">
              {dogs.map((dog) => (
                <div
                  key={dog.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DogAvatar name={dog.name} photoUrl={dog.photoUrl} size="md" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {dog.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dog.breed} • {dog.age} months old
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteDog(dog.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No dogs added yet
              </p>
              <Button variant="outline" onClick={() => setShowAddDogModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Dog
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Notifications */}
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Notifications
              </span>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === 'notifications' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'notifications' && (
            <div className="ml-11 p-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Goal reminders</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Session reminders</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Progress updates</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          )}

          {/* Privacy & Security */}
          <button
            onClick={() => toggleSection('privacy')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Privacy & Security
              </span>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === 'privacy' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'privacy' && (
            <div className="ml-11 p-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Share usage data</span>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Enable analytics</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          )}

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Dark Mode
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isDarkMode ? 'On' : 'Off'}
            </span>
          </button>

          {/* About PuppySteps */}
          <button
            onClick={() => toggleSection('about')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                About PuppySteps
              </span>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === 'about' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'about' && (
            <div className="ml-11 p-3 text-sm space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                Version 1.0.0
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Helping you raise well-socialized, happy puppies! 🐾
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>
            Get help and provide feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <button
            onClick={() => window.location.href = 'mailto:support@puppysteps.app'}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Contact Support
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={() => console.log('Open help center')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Help Center
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Sign Out
          </CardTitle>
          <CardDescription>
            Leave your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Add Dog Modal */}
      <AddDogModal
        isOpen={showAddDogModal}
        onClose={() => setShowAddDogModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Dog"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this dog? This action cannot be undone and will also delete all associated socialisation sessions.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDog}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
