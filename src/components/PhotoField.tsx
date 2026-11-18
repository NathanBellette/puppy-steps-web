import { X } from 'lucide-react';
import { Input } from './ui/Input';
import { FormField } from './ui/FormField';
import { usePhotoInput } from '@/hooks/usePhotoInput';

type PhotoFieldProps = ReturnType<typeof usePhotoInput> & {
  id: string;
  disabled?: boolean;
};

/** Optional photo picker driven by usePhotoInput; shows the chosen file with a button to remove it. */
export const PhotoField = ({ id, photo, setPhoto, handlePhotoChange, disabled }: PhotoFieldProps) => (
  <FormField label="Photo (optional)" htmlFor={id}>
    <Input id={id} type="file" accept="image/*" onChange={handlePhotoChange} disabled={disabled} />
    {photo && (
      <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <span className="flex-1">{photo.name}</span>
        <button
          type="button"
          onClick={() => setPhoto(null)}
          className="text-red-500 hover:text-red-700 p-1"
          disabled={disabled}
          aria-label="Remove photo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}
  </FormField>
);
