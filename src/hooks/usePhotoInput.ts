import { useState, ChangeEvent } from 'react';

/** Tracks an optional photo chosen through a file input. */
export const usePhotoInput = () => {
  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  return { photo, setPhoto, handlePhotoChange };
};
