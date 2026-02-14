import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Spinner } from './ui/Spinner';
import { useSessions } from '@/hooks/useSessions';
import { useToast } from '@/context/ToastContext';
import {
  SessionType,
  SESSION_TYPE_EMOJI,
  SESSION_CATEGORIES,
  ReactionLevel,
  REACTION_LABELS,
  PlaceType,
  Intensity,
  PLACE_TYPES,
  PLACE_TYPE_LABELS,
  INTENSITY_LEVELS,
  INTENSITY_LABELS,
} from '@/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  dogName: string;
  /** Pre-fill exposure type when opening from a target card */
  prefillType?: SessionType;
  /** Pre-fill category when opening from a target card */
  prefillCategory?: string;
}

const sessionFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['people', 'dogs', 'environments', 'noises']),
  category: z.string().min(1, 'Please select a category'),
  reaction: z.enum(['😰', '😟', '😐', '😊', '😍']),
  placeType: z.enum(['Home', 'Street', 'Park', 'Store', 'Cafe', 'Car', 'Vet', 'PublicTransport', 'Other']),
  intensity: z.enum(['low', 'medium', 'high']),
  isNewToDog: z.boolean(),
  notes: z.string(),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

const reactionLevels: ReactionLevel[] = ['😰', '😟', '😐', '😊', '😍'];

export const LogSessionModal = ({
  isOpen,
  onClose,
  dogId,
  dogName,
  prefillType,
  prefillCategory,
}: LogSessionModalProps) => {
  const { createSession, isCreating } = useSessions(dogId);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: prefillType ?? 'people',
      category: prefillCategory ?? '',
      reaction: '😊',
      placeType: 'Home',
      intensity: 'low',
      isNewToDog: false,
      notes: '',
    },
  });

  const selectedType = watch('type');
  const selectedReaction = watch('reaction');
  const selectedPlace = watch('placeType');
  const selectedIntensity = watch('intensity');
  const isNewToDog = watch('isNewToDog');

  const showNewToDog = selectedType === 'people' || selectedType === 'dogs';

  // Photo is managed separately since react-hook-form doesn't handle File objects well with zod
  const [photo, setPhoto] = useState<File | null>(null);

  // Apply prefill values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (prefillType) setValue('type', prefillType);
      if (prefillCategory) setValue('category', prefillCategory);
    }
  }, [isOpen, prefillType, prefillCategory, setValue]);

  const handleTypeChange = (type: SessionType) => {
    setValue('type', type);
    setValue('category', '');
    setValue('isNewToDog', false);
  };

  const resetForm = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      type: prefillType ?? 'people',
      category: prefillCategory ?? '',
      reaction: '😊',
      placeType: 'Home',
      intensity: 'low',
      isNewToDog: false,
      notes: '',
    });
    setPhoto(null);
  };

  const onSubmit = async (data: SessionFormValues) => {
    try {
      await createSession({
        dogId,
        date: new Date(data.date),
        type: data.type,
        category: data.category,
        reaction: data.reaction as ReactionLevel,
        placeType: data.placeType as PlaceType,
        intensity: data.intensity as Intensity,
        isNewToDog: showNewToDog ? data.isNewToDog : false,
        notes: data.notes || undefined,
        photo: photo || undefined,
      });

      resetForm();
      onClose();
      showToast('Exposure logged successfully!', 'success');
    } catch {
      // Show inline error — handled by the form error display
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Exposure for ${dogName}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Date
          </label>
          <Input
            type="date"
            id="date"
            {...register('date')}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        {/* Exposure Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Exposure Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['people', 'dogs', 'environments', 'noises'] as SessionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all flex items-center gap-2',
                  selectedType === type
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <span className="text-2xl">{SESSION_TYPE_EMOJI[type]}</span>
                <span className="text-sm font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Select a category</option>
            {SESSION_CATEGORIES[selectedType].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Place */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Place
          </label>
          <div className="flex flex-wrap gap-2">
            {PLACE_TYPES.map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => setValue('placeType', place)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  selectedPlace === place
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {PLACE_TYPE_LABELS[place]}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Intensity
          </label>
          <div className="flex gap-2">
            {INTENSITY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setValue('intensity', level)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-center',
                  selectedIntensity === level
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                )}
              >
                {INTENSITY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* New to my dog? (People/Dogs only) */}
        {showNewToDog && (
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewToDog}
                onChange={(e) => setValue('isNewToDog', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  New to my dog
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  First time meeting this individual
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Reaction */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Reaction
          </label>
          <div className="flex justify-between gap-2">
            {reactionLevels.map((reaction) => (
              <button
                key={reaction}
                type="button"
                onClick={() => setValue('reaction', reaction)}
                className={cn(
                  'flex-1 p-3 rounded-lg border-2 transition-all',
                  selectedReaction === reaction
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-110'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
                title={REACTION_LABELS[reaction]}
              >
                <span className="text-3xl">{reaction}</span>
                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                  {REACTION_LABELS[reaction]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
            placeholder="Add any additional notes about this exposure..."
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Photo (optional)
          </label>
          <Input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photo && (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>{photo.name}</span>
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-red-500 hover:text-red-700"
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
            onClick={onClose}
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
                <Spinner className="mr-2" />
                Logging...
              </>
            ) : (
              'Log Exposure'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
