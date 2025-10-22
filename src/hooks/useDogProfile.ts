import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { 
  getUserDogs, 
  createDog, 
  updateDog, 
  deleteDog,
  getDog 
} from '@/lib/firestore';
import { uploadDogPhoto } from '@/lib/storage';
import { DogFormData } from '@/types';

export const useDogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const createDogMutation = useMutation({
    mutationFn: async (dogData: DogFormData & { photo?: File }) => {
      let photoUrl: string | undefined;
      
      if (dogData.photo) {
        photoUrl = await uploadDogPhoto(dogData.photo, user!.uid, 'temp');
      }

      const { photo: _photo, ...data } = dogData;
      return createDog({
        ...data,
        userId: user!.uid,
        photoUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
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

      const { photo: _omit, ...updateData } = data;
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
