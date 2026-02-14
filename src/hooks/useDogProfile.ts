import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  getUserDogs, 
  createDog, 
  updateDog, 
  deleteDog,
  getDog,
  createGoalsBatch,
} from '@/lib/firestore';
import { uploadDogPhoto } from '@/lib/storage';
import { Dog, DogFormData } from '@/types';
import { createInitialGoalsForDog } from '@/types/goal';

const SELECTED_DOG_KEY = 'selectedDogId';

/**
 * Primary hook for all dog operations.
 * Manages the dog list via React Query and the selected dog via localStorage.
 */
export const useDogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDogId, setSelectedDogId] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_DOG_KEY);
  });

  const {
    data: dogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dogs', user?.uid],
    queryFn: () => getUserDogs(user!.uid),
    enabled: !!user,
  });

  // Derive selectedDog from the list + stored ID
  const selectedDog = dogs.find(d => d.id === selectedDogId) ?? dogs[0] ?? null;

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

  const createDogMutation = useMutation({
    mutationFn: async (dogData: DogFormData & { photo?: File }) => {
      let photoUrl: string | undefined;
      
      if (dogData.photo) {
        photoUrl = await uploadDogPhoto(dogData.photo, user!.uid, 'temp');
      }

      const { photo: _photo, ...data } = dogData;
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid] });
    },
  });

  const updateDogMutation = useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      photo 
    }: { 
      id: string; 
      data: Partial<DogFormData>; 
      photo?: File 
    }) => {
      let photoUrl = data.photoUrl;
      
      if (photo) {
        photoUrl = await uploadDogPhoto(photo, user!.uid, id);
      }

      const { photoUrl: _omit, ...updateData } = data;
      return updateDog(id, { ...updateData, photoUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
    },
  });

  const deleteDogMutation = useMutation({
    mutationFn: deleteDog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
    },
  });

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

export const useDog = (dogId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dog', dogId],
    queryFn: () => getDog(dogId),
    enabled: !!user && !!dogId,
  });
};
