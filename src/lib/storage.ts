import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

/** Builds an uploader that stores photos under `<folder>/<userId>/<documentId>/`, timestamped to keep names unique. */
const photoUploader = (folder: string) => (file: File, userId: string, documentId: string): Promise<string> =>
  uploadImage(file, `${folder}/${userId}/${documentId}/${Date.now()}_${file.name}`);

export const uploadDogPhoto = photoUploader('dogs');
export const uploadSessionPhoto = photoUploader('sessions');
