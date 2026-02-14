import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

export const deleteImage = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const getImageUrl = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

// Helper functions for specific use cases
export const uploadDogPhoto = async (file: File, userId: string, dogId: string): Promise<string> => {
  const path = `dogs/${userId}/${dogId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
};

export const uploadSessionPhoto = async (file: File, userId: string, sessionId: string): Promise<string> => {
  const path = `sessions/${userId}/${sessionId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
};

export const uploadUserAvatar = async (file: File, userId: string): Promise<string> => {
  const path = `avatars/${userId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
};
