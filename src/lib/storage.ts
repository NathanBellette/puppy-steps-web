import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const getImageUrl = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Get image URL error:', error);
    throw error;
  }
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
