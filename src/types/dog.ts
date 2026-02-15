export interface Dog {
  id: string;
  userId: string;
  name: string;
  age: number; // in months
  breed: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DogProfile extends Dog {
  // Additional profile-specific fields can be added here
}

export type DogFormData = Omit<Dog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
