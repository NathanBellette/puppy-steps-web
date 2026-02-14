import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogProfile';
import { DogAvatar } from '@/components/ui/DogAvatar';
import { Select, SelectOption } from '@/components/ui/Select';

export const Header = () => {
  const { user } = useAuth();
  const { dogs, selectedDog, setSelectedDog } = useDogs();

  const handleDogChange = (dogId: string) => {
    const dog = dogs.find(d => d.id === dogId);
    if (dog) {
      setSelectedDog(dog);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side — App name (mobile only) + Dog selector */}
        <div className="flex items-center">
          {/* Mobile app name */}
          <div className="lg:hidden flex items-center mr-4">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
          </div>

          {/* Dog selector */}
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

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User info */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.displayName || 'User'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
