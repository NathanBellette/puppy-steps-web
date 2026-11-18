import { useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PhotoField } from '@/components/PhotoField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useSessions } from '@/hooks/useSessions';
import { usePhotoInput } from '@/hooks/usePhotoInput';
import { useToast } from '@/context/ToastContext';
import { useDogs } from '@/hooks/useDogProfile';
import {
  SessionType,
  SESSION_TYPES,
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
import { cn, formatDateLong } from '@/lib/utils';
import { ArrowLeft, Calendar } from 'lucide-react';

const reactionLevels: ReactionLevel[] = ['😰', '😟', '😐', '😊', '😍'];

const placeItems = PLACE_TYPES.map((place) => ({ value: place, label: PLACE_TYPE_LABELS[place] }));

const fieldClassName =
  'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100';

/** Today's date as YYYY-MM-DD, the format used by date inputs. */
const todayIsoDate = () => new Date().toISOString().split('T')[0];

interface OptionGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Layout classes for the options container */
  className: string;
  /** Classes for every option; selected/unselected classes extend the shared bordered states */
  optionClassName: string;
  selectedClassName?: string;
  unselectedClassName?: string;
  renderOption: (option: T) => ReactNode;
  getTitle?: (option: T) => string;
}

/** A labelled group of bordered buttons with exactly one option selected. */
const OptionGroup = <T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  optionClassName,
  selectedClassName,
  unselectedClassName,
  renderOption,
  getTitle,
}: OptionGroupProps<T>) => (
  <FormField label={label} labelClassName="mb-2">
    <div className={className}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'rounded-lg border-2 transition-all',
            optionClassName,
            value === option
              ? cn('border-primary-500 bg-primary-50 dark:bg-primary-900/20', selectedClassName)
              : cn('border-slate-200 dark:border-slate-700 hover:border-slate-300', unselectedClassName)
          )}
          title={getTitle?.(option)}
        >
          {renderOption(option)}
        </button>
      ))}
    </div>
  </FormField>
);

export const LogExposure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDog } = useDogs();
  const { showToast } = useToast();

  // Get pre-fill data from navigation state
  const { prefillType, prefillCategory } = (location.state as {
    prefillType?: SessionType;
    prefillCategory?: string;
  }) || {};

  const { createSession, isCreating } = useSessions(selectedDog?.id || '');

  const [selectedType, setSelectedType] = useState<SessionType>(prefillType ?? 'people');
  const [selectedCategory, setSelectedCategory] = useState<string>(prefillCategory ?? '');
  const [selectedReaction, setSelectedReaction] = useState<ReactionLevel>('😊');
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>('Home');
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>('low');
  const [isNewToDog, setIsNewToDog] = useState<boolean>(false);
  const [date, setDate] = useState<string>(todayIsoDate);
  const [notes, setNotes] = useState<string>('');
  const photoInput = usePhotoInput();
  const { photo } = photoInput;
  const [formError, setFormError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Redirect if no dog selected
  useEffect(() => {
    if (!selectedDog) {
      navigate('/dashboard');
      showToast('Please select a dog first', 'error');
    }
  }, [selectedDog, navigate, showToast]);

  // Apply prefill values when they change
  useEffect(() => {
    if (prefillType) setSelectedType(prefillType);
    if (prefillCategory) setSelectedCategory(prefillCategory);
  }, [prefillType, prefillCategory]);

  const showNewToDog = selectedType === 'people' || selectedType === 'dogs';

  // Reset category when type changes
  const handleTypeChange = (type: SessionType) => {
    setSelectedType(type);
    setSelectedCategory('');
    setIsNewToDog(false);
    setFormError(null);
  };

  const handleCancel = () => {
    // TODO: Show confirmation if form has unsaved changes
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCategory) {
      setFormError('Please select a category');
      // Scroll to category field
      document.getElementById('category')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!selectedDog) {
      setFormError('No dog selected');
      return;
    }

    try {
      await createSession({
        dogId: selectedDog.id,
        date: new Date(date),
        type: selectedType,
        category: selectedCategory,
        reaction: selectedReaction,
        placeType: selectedPlace,
        intensity: selectedIntensity,
        isNewToDog: showNewToDog ? isNewToDog : false,
        notes: notes || undefined,
        photo: photo || undefined,
      });

      showToast('Exposure logged successfully!', 'success');
      navigate(-1); // Go back to previous page
    } catch {
      setFormError('Failed to log exposure. Please try again.');
    }
  };

  if (!selectedDog) {
    return null; // Will redirect in useEffect
  }

  const formattedDate = formatDateLong(new Date(date + 'T00:00:00'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Log Exposure
          </h1>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !selectedCategory}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="py-6 px-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dog Name */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Logging for <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedDog.name}</span>
            </p>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {formError}
            </div>
          )}

          <FormField label="Date" htmlFor="date">
            <input
              ref={dateInputRef}
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={todayIsoDate()}
              className="sr-only"
              aria-label="Select date"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dateInputRef.current?.showPicker();
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-left text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              aria-label={`Selected date: ${formattedDate}. Click to change.`}
              tabIndex={0}
            >
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                {formattedDate}
              </span>
            </button>
          </FormField>

          <OptionGroup
            label="Exposure Type"
            options={SESSION_TYPES}
            value={selectedType}
            onChange={handleTypeChange}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            optionClassName="p-3 flex items-center justify-center gap-2"
            renderOption={(type) => (
              <>
                <span className="text-2xl">{SESSION_TYPE_EMOJI[type]}</span>
                <span className="text-sm font-medium capitalize">{type}</span>
              </>
            )}
          />

          <FormField label="Category" htmlFor="category">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFormError(null);
              }}
              required
              className={fieldClassName}
            >
              <option value="">Select a category</option>
              {SESSION_CATEGORIES[selectedType].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Place" labelClassName="mb-2">
            <SegmentedControl items={placeItems} value={selectedPlace} onChange={setSelectedPlace} />
          </FormField>

          <OptionGroup
            label="Intensity"
            options={INTENSITY_LEVELS}
            value={selectedIntensity}
            onChange={setSelectedIntensity}
            className="grid grid-cols-3 gap-2"
            optionClassName="px-4 py-3 text-sm font-medium text-center"
            selectedClassName="text-primary-700 dark:text-primary-300"
            unselectedClassName="text-slate-700 dark:text-slate-300"
            renderOption={(level) => INTENSITY_LABELS[level]}
          />

          {/* New to my dog? (People/Dogs only) */}
          {showNewToDog && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isNewToDog}
                  onChange={(e) => setIsNewToDog(e.target.checked)}
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

          <OptionGroup
            label="Reaction"
            options={reactionLevels}
            value={selectedReaction}
            onChange={setSelectedReaction}
            className="grid grid-cols-5 gap-2"
            optionClassName="p-3 flex flex-col items-center"
            selectedClassName="scale-105"
            getTitle={(reaction) => REACTION_LABELS[reaction]}
            renderOption={(reaction) => (
              <>
                <span className="text-3xl sm:text-4xl">{reaction}</span>
                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 hidden sm:block">
                  {REACTION_LABELS[reaction]}
                </p>
              </>
            )}
          />

          <FormField label="Notes (optional)" htmlFor="notes">
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={fieldClassName}
              placeholder="Add any additional notes about this exposure..."
            />
          </FormField>

          <PhotoField id="photo" {...photoInput} />

        </form>
      </div>
    </div>
  );
};
