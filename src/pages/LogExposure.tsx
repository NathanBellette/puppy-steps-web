import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSessions } from '@/hooks/useSessions';
import { useToast } from '@/context/ToastContext';
import { useDogs } from '@/hooks/useDogProfile';
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
import { X, ArrowLeft } from 'lucide-react';

const reactionLevels: ReactionLevel[] = ['😰', '😟', '😐', '😊', '😍'];

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
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  if (!selectedDog) {
    return null; // Will redirect in useEffect
  }

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

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          {/* Exposure Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Exposure Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['people', 'dogs', 'environments', 'noises'] as SessionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2',
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
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFormError(null);
              }}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Select a category</option>
              {SESSION_CATEGORIES[selectedType].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
                  onClick={() => setSelectedPlace(place)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
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
            <div className="grid grid-cols-3 gap-2">
              {INTENSITY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedIntensity(level)}
                  className={cn(
                    'px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-center',
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

          {/* Reaction */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reaction
            </label>
            <div className="grid grid-cols-5 gap-2">
              {reactionLevels.map((reaction) => (
                <button
                  key={reaction}
                  type="button"
                  onClick={() => setSelectedReaction(reaction)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex flex-col items-center',
                    selectedReaction === reaction
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  )}
                  title={REACTION_LABELS[reaction]}
                >
                  <span className="text-3xl sm:text-4xl">{reaction}</span>
                  <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 hidden sm:block">
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
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
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="flex-1">{photo.name}</span>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Bottom Actions (Duplicate for convenience) */}
          <div className="flex gap-3 pt-4 pb-8 sm:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !selectedCategory}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Exposure'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
