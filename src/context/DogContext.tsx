import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dog } from '@/types';
import { getUserDogs } from '@/lib/firestore';
import { useAuth } from './AuthContext';

interface DogContextType {
  dogs: Dog[];
  selectedDog: Dog | null;
  setSelectedDog: (dog: Dog | null) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DogContext = createContext<DogContextType | undefined>(undefined);

export const useDogs = () => {
  const context = useContext(DogContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogProvider');
  }
  return context;
};

interface DogProviderProps {
  children: React.ReactNode;
}

export const DogProvider: React.FC<DogProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = async () => {
    if (!user) {
      setDogs([]);
      setSelectedDog(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userDogs = await getUserDogs(user.uid);
      setDogs(userDogs);
      
      // Set first dog as selected if none selected
      if (userDogs.length > 0 && !selectedDog) {
        setSelectedDog(userDogs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dogs');
      console.error('Error fetching dogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [user]);

  // Update selected dog when dogs change
  useEffect(() => {
    if (dogs.length > 0 && !selectedDog) {
      setSelectedDog(dogs[0]);
    } else if (dogs.length === 0) {
      setSelectedDog(null);
    } else if (selectedDog && !dogs.find(d => d.id === selectedDog.id)) {
      // Selected dog was deleted, select first available
      setSelectedDog(dogs[0]);
    }
  }, [dogs, selectedDog]);

  const handleSetSelectedDog = (dog: Dog | null) => {
    setSelectedDog(dog);
    // Store selection in localStorage for persistence
    if (dog) {
      localStorage.setItem('selectedDogId', dog.id);
    } else {
      localStorage.removeItem('selectedDogId');
    }
  };

  // Restore selected dog from localStorage on mount
  useEffect(() => {
    const savedDogId = localStorage.getItem('selectedDogId');
    if (savedDogId && dogs.length > 0) {
      const savedDog = dogs.find(d => d.id === savedDogId);
      if (savedDog) {
        setSelectedDog(savedDog);
      }
    }
  }, [dogs]);

  const value: DogContextType = {
    dogs,
    selectedDog,
    setSelectedDog: handleSetSelectedDog,
    loading,
    error,
    refetch: fetchDogs,
  };

  return (
    <DogContext.Provider value={value}>
      {children}
    </DogContext.Provider>
  );
};
