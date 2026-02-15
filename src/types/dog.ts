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

export type DogFormData = Omit<Dog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
