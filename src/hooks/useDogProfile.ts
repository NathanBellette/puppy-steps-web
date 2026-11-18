import { useState, useEffect, useCallback } from 'react';
import { 
  getUserDogs, 
  createDog, 
  updateDog, 
  deleteDog,
  createGoalsBatch,
} from '@/lib/firestore';
import { uploadDogPhoto } from '@/lib/storage';
import { Dog, DogFormData } from '@/types';
import { createInitialGoalsForDog } from '@/types/goal';
import { useRefreshingMutation, useUserDocuments } from './useUserDocuments';

const SELECTED_DOG_KEY = 'selectedDogId';

/**
 * Primary hook for all dog operations.
 * Manages the dog list via React Query and the selected dog via localStorage.
 */
export const useDogs = () => {
  const [selectedDogId, setSelectedDogId] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_DOG_KEY);
  });

  const {
    user,
    queryKey,
    data: dogs,
    isLoading,
    error,
    refetch
  } = useUserDocuments('dogs', [], getUserDogs);

  // Derive selectedDog from the list + stored ID
  const selectedDog = dogs.find(d => d.id === selectedDogId) ?? (dogs[0] as Dog | undefined) ?? null;

  // Keep selectedDogId in sync: auto-select first dog if nothing selected or selection invalid
  useEffect(() => {
    if (dogs.length === 0) {
      setSelectedDogId(null);
      localStorage.removeItem(SELECTED_DOG_KEY);
      return;
    }

    const currentIsValid = dogs.some(d => d.id === selectedDogId);
    if (!currentIsValid) {
      setSelectedDogId(dogs[0].id);
      localStorage.setItem(SELECTED_DOG_KEY, dogs[0].id);
    }
  }, [dogs, selectedDogId]);

  const setSelectedDog = useCallback((dog: Dog | null) => {
    if (dog) {
      setSelectedDogId(dog.id);
      localStorage.setItem(SELECTED_DOG_KEY, dog.id);
    } else {
      setSelectedDogId(null);
      localStorage.removeItem(SELECTED_DOG_KEY);
    }
  }, []);

  // Refreshes the goal lists too, since a new dog starts with predefined goals
  const createDogMutation = useRefreshingMutation(async ({ photo, ...data }: DogFormData & { photo?: File }) => {
    const photoUrl = photo ? await uploadDogPhoto(photo, user!.uid, 'temp') : undefined;
    const dogId = await createDog({
      ...data,
      userId: user!.uid,
      photoUrl,
    });

    // Auto-create predefined goals for the new dog
    try {
      const initialGoals = createInitialGoalsForDog(dogId, user!.uid);
      await createGoalsBatch(initialGoals);
    } catch {
      // Goals creation failed — non-critical, user can still create later
    }

    return dogId;
  }, queryKey, ['goals', user?.uid]);

  const updateDogMutation = useRefreshingMutation(async ({ 
    id, 
    data, 
    photo 
  }: { 
    id: string; 
    data: Partial<DogFormData>; 
    photo?: File 
  }) => {
    const { photoUrl: currentPhotoUrl, ...updateData } = data;
    const photoUrl = photo ? await uploadDogPhoto(photo, user!.uid, id) : currentPhotoUrl;
    return updateDog(id, { ...updateData, photoUrl });
  }, queryKey);

  const deleteDogMutation = useRefreshingMutation(deleteDog, queryKey);

  return {
    dogs,
    selectedDog,
    setSelectedDog,
    isLoading,
    error,
    refetch,
    createDog: createDogMutation.mutateAsync,
    updateDog: updateDogMutation.mutateAsync,
    deleteDog: deleteDogMutation.mutateAsync,
    isCreating: createDogMutation.isPending,
    isUpdating: updateDogMutation.isPending,
    isDeleting: deleteDogMutation.isPending,
  };
};

