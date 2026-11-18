import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Spinner } from './ui/Spinner';
import { FormField } from './ui/FormField';
import { PhotoField } from './PhotoField';
import { useDogs } from '@/hooks/useDogProfile';
import { usePhotoInput } from '@/hooks/usePhotoInput';

interface AddDogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm = { name: '', age: '', breed: '' };

type DogForm = typeof emptyForm;

const textFields: Array<{
  key: keyof DogForm;
  label: string;
  placeholder: string;
  type?: string;
  min?: string;
  max?: string;
  hint?: string;
}> = [
  { key: 'name', label: 'Name *', placeholder: 'e.g., Buddy' },
  {
    key: 'age',
    label: 'Age (in months) *',
    placeholder: 'e.g., 6',
    type: 'number',
    min: '0',
    max: '300',
    hint: 'Enter age in months (e.g., 6 months old)',
  },
  { key: 'breed', label: 'Breed *', placeholder: 'e.g., Golden Retriever' },
];

export const AddDogModal = ({ isOpen, onClose }: AddDogModalProps) => {
  const { createDog, isCreating } = useDogs();
  const [form, setForm] = useState<DogForm>(emptyForm);
  const photoInput = usePhotoInput();
  const { photo, setPhoto } = photoInput;
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm(emptyForm);
    setPhoto(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!form.age || parseInt(form.age) < 0) {
      setError('Please enter a valid age');
      return;
    }

    if (!form.breed.trim()) {
      setError('Please enter a breed');
      return;
    }

    try {
      await createDog({
        name: form.name.trim(),
        age: parseInt(form.age),
        breed: form.breed.trim(),
        photo: photo || undefined,
      });

      resetForm();
      onClose();
    } catch {
      setError('Failed to add dog. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
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

        {textFields.map(({ key, label, placeholder, type = 'text', min, max, hint }) => (
          <FormField key={key} label={label} htmlFor={`dog-${key}`} hint={hint}>
            <Input
              id={`dog-${key}`}
              type={type}
              min={min}
              max={max}
              value={form[key]}
              onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
              placeholder={placeholder}
              required
              disabled={isCreating}
            />
          </FormField>
        ))}

        <PhotoField id="dog-photo" {...photoInput} disabled={isCreating} />

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
                <Spinner size="sm" className="text-white mr-2" />
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
