import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useSessions } from '@/hooks/useSessions';
import { SessionType, SESSION_TYPE_EMOJI, SESSION_CATEGORIES, ReactionLevel, REACTION_LABELS } from '@/types';
import { X } from 'lucide-react';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  dogName: string;
}

const reactionLevels: ReactionLevel[] = ['😍', '😊', '😐', '😟', '😰'];

export const LogSessionModal = ({ isOpen, onClose, dogId, dogName }: LogSessionModalProps) => {
  const { createSession, isCreating } = useSessions(dogId);
  const [selectedType, setSelectedType] = useState<SessionType>('people');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedReaction, setSelectedReaction] = useState<ReactionLevel>('😊');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);

  // Reset category when type changes
  const handleTypeChange = (type: SessionType) => {
    setSelectedType(type);
    setSelectedCategory(''); // Reset category when type changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    try {
      await createSession({
        dogId,
        date: new Date(date),
        type: selectedType,
        category: selectedCategory,
        reaction: selectedReaction,
        notes: notes || undefined,
        photo: photo || undefined,
      });

      // Reset form
      setSelectedType('people');
      setSelectedCategory('');
      setSelectedReaction('😊');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setPhoto(null);
      
      onClose();
    } catch {
      alert('Failed to log session. Please try again.');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Session for ${dogName}`} className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <Input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['people', 'dogs', 'environments', 'noises'] as SessionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  selectedType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{SESSION_TYPE_EMOJI[type]}</span>
                <span className="text-sm font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">Select a category</option>
            {SESSION_CATEGORIES[selectedType].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Reaction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reaction
          </label>
          <div className="flex justify-between gap-2">
            {reactionLevels.map((reaction) => (
              <button
                key={reaction}
                type="button"
                onClick={() => setSelectedReaction(reaction)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedReaction === reaction
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                title={REACTION_LABELS[reaction]}
              >
                <span className="text-3xl">{reaction}</span>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {REACTION_LABELS[reaction]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            placeholder="Add any additional notes about this session..."
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Photo (optional)
          </label>
          <Input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photo && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
            disabled={isCreating || !selectedCategory}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Logging...
              </>
            ) : (
              'Log Session'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

