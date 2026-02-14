import { Menu, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogProfile';
import { DogAvatar } from '@/components/ui/DogAvatar';
import { Select, SelectOption } from '@/components/ui/Select';

export interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const { dogs, selectedDog, setSelectedDog } = useDogs();

  const handleDogChange = (dogId: string) => {
    const dog = dogs.find(d => d.id === dogId);
    if (dog) {
      setSelectedDog(dog);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Dog selector */}
          <div className="ml-4 lg:ml-0">
            <div className="flex items-center space-x-3">
              {selectedDog && (
                <DogAvatar
                  name={selectedDog.name}
                  photoUrl={selectedDog.photoUrl}
                  size="sm"
                />
              )}
              <div className="min-w-0 flex-1">
                <Select
                  value={selectedDog?.id || ''}
                  onChange={(e) => handleDogChange(e.target.value)}
                  className="w-48"
                >
                  <SelectOption value="" disabled>
                    Select a dog
                  </SelectOption>
                  {dogs.map((dog) => (
                    <SelectOption key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.displayName || 'User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
