import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DogAvatar } from '@/components/ui/DogAvatar';
import { Modal } from '@/components/ui/Modal';
import { AddDogModal } from '@/components/AddDogModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsListItem } from '@/components/ui/SettingsListItem';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogProfile';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Info, 
  Mail, 
  Plus,
  Trash2,
  ChevronRight
} from 'lucide-react';

const DARK_MODE_KEY = 'puppysteps-dark-mode';

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  return document.documentElement.classList.contains('dark');
}

export const Settings = () => {
  const { user, signOut } = useAuth();
  const { dogs, deleteDog } = useDogs();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dogToDelete, setDogToDelete] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem(DARK_MODE_KEY, String(newValue));
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteDog = (dogId: string) => {
    setDogToDelete(dogId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDog = async () => {
    if (dogToDelete) {
      try {
        await deleteDog(dogToDelete);
      } catch {
        // Deletion failed silently — could add toast here later
      }
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account and application preferences
        </p>
      </div>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <User className="h-10 w-10 text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 rounded-full p-2" />
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {user?.email || 'Unknown'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
              <CardDescription>Manage your dog profiles</CardDescription>
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
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DogAvatar name={dog.name} photoUrl={dog.photoUrl} size="md" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {dog.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {dog.breed} • {dog.age} months old
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
            <EmptyState
              icon={User}
              title="No dogs added yet"
              description="Add your first dog to start tracking socialization."
              actionLabel="Add Your First Dog"
              onAction={() => setShowAddDogModal(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsListItem
            icon={isDarkMode ? Moon : Sun}
            iconColor={isDarkMode ? 'text-accent-600 dark:text-accent-400' : 'text-amber-600 dark:text-amber-400'}
            label="Dark Mode"
            onClick={toggleDarkMode}
            rightContent={
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {isDarkMode ? 'On' : 'Off'}
              </span>
            }
          />

          <SettingsListItem
            icon={Info}
            iconColor="text-primary-600 dark:text-primary-400"
            label="About PuppySteps"
            expandable
            expanded={expandedSection === 'about'}
            onClick={() => toggleSection('about')}
          >
            <p className="text-slate-700 dark:text-slate-300">
              Version 1.0.0
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Helping you raise well-socialized, happy puppies!
            </p>
          </SettingsListItem>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help and provide feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsListItem
            icon={Mail}
            iconColor="text-accent-600 dark:text-accent-400"
            label="Contact Support"
            onClick={() => window.location.href = 'mailto:support@puppysteps.app'}
            rightContent={<ChevronRight className="h-5 w-5 text-slate-400" />}
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Sign Out</CardTitle>
          <CardDescription>Leave your account</CardDescription>
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
          <p className="text-slate-600 dark:text-slate-400">
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
