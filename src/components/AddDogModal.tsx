import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useDogs } from '@/hooks/useDogProfile';
import { X } from 'lucide-react';

interface AddDogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDogModal = ({ isOpen, onClose }: AddDogModalProps) => {
  const { createDog, isCreating } = useDogs();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!age || parseInt(age) < 0) {
      setError('Please enter a valid age');
      return;
    }

    if (!breed.trim()) {
      setError('Please enter a breed');
      return;
    }

    try {
      await createDog({
        name: name.trim(),
        age: parseInt(age),
        breed: breed.trim(),
        photo: photo || undefined,
      });

      // Reset form
      setName('');
      setAge('');
      setBreed('');
      setPhoto(null);
      setError('');
      
      onClose();
    } catch {
      setError('Failed to add dog. Please try again.');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName('');
      setAge('');
      setBreed('');
      setPhoto(null);
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Dog Profile" className="p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="dog-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <Input
            id="dog-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Buddy"
            required
            disabled={isCreating}
          />
        </div>

        {/* Age */}
        <div>
          <label htmlFor="dog-age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age (in months) *
          </label>
          <Input
            id="dog-age"
            type="number"
            min="0"
            max="300"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 6"
            required
            disabled={isCreating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter age in months (e.g., 6 months old)
          </p>
        </div>

        {/* Breed */}
        <div>
          <label htmlFor="dog-breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Breed *
          </label>
          <Input
            id="dog-breed"
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="e.g., Golden Retriever"
            required
            disabled={isCreating}
          />
        </div>

        {/* Photo */}
        <div>
          <label htmlFor="dog-photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Photo (optional)
          </label>
          <Input
            id="dog-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={isCreating}
          />
          {photo && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{photo.name}</span>
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-red-500 hover:text-red-700"
                disabled={isCreating}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : (
              'Add Dog'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

