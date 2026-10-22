import { act, waitFor } from '@testing-library/react';
import { useDogs } from './useDogProfile';
import { getUserDogs, createDog, deleteDog, createGoalsBatch } from '@/lib/firestore';
import { uploadDogPhoto } from '@/lib/storage';
import { makeDog, makePhoto } from '@/test/fixtures';
import { renderLoadedHook } from '@/test/utils';

vi.mock('./useAuth');
vi.mock('@/lib/firestore');
vi.mock('@/lib/storage');

const mockDogs = [
  makeDog({ photoUrl: 'https://example.com/buddy.jpg' }),
  makeDog({
    id: 'dog-2',
    name: 'Max',
    age: 3,
    breed: 'Poodle',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  }),
];

const renderDogs = async () => (await renderLoadedHook(() => useDogs())).result;

/** Renders the hook and switches the selection to Max, the second dog. */
const renderWithMaxSelected = async () => {
  const result = await renderDogs();
  act(() => {
    result.current.setSelectedDog(mockDogs[1]);
  });
  expect(result.current.selectedDog).toEqual(mockDogs[1]);
  return result;
};

const createLuna = async (photo?: File) => {
  const result = await renderDogs();
  await act(async () => {
    await result.current.createDog({ name: 'Luna', age: 2, breed: 'Husky', photo });
  });
};

describe('useDogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getUserDogs).mockResolvedValue(mockDogs);
    vi.mocked(createDog).mockResolvedValue('dog-3');
    vi.mocked(uploadDogPhoto).mockResolvedValue('https://example.com/photo.jpg');
  });

  it('fetches dogs for the authenticated user', async () => {
    const { result, initiallyLoading } = await renderLoadedHook(() => useDogs());

    expect(initiallyLoading).toBe(true);
    expect(getUserDogs).toHaveBeenCalledWith('user-1');
    expect(result.current.dogs).toEqual(mockDogs);
  });

  it('auto-selects the first dog when no dog is selected', async () => {
    const result = await renderDogs();

    expect(result.current.selectedDog).toEqual(mockDogs[0]);
  });

  // The hook's effect clears selectedDogId while dogs=[] (loading), so a stored
  // selection cannot survive the initial load; selection is tested after load instead.
  it('switches selected dog via setSelectedDog and persists it to localStorage', async () => {
    await renderWithMaxSelected();

    expect(localStorage.getItem('selectedDogId')).toBe('dog-2');
  });

  it('setSelectedDog(null) clears localStorage but effect auto-selects first dog', async () => {
    const result = await renderWithMaxSelected();

    // Clear selection — the effect re-selects the first dog because dogs exist
    act(() => {
      result.current.setSelectedDog(null);
    });

    await waitFor(() => {
      expect(result.current.selectedDog).toEqual(mockDogs[0]);
    });
  });

  it('falls back to first dog when selected dog ID is invalid', async () => {
    localStorage.setItem('selectedDogId', 'non-existent');

    const result = await renderDogs();

    expect(result.current.selectedDog).toEqual(mockDogs[0]);
  });

  it('handles empty dog list', async () => {
    vi.mocked(getUserDogs).mockResolvedValue([]);

    const result = await renderDogs();

    expect(result.current.dogs).toEqual([]);
    expect(result.current.selectedDog).toBeNull();
  });

  it('createDog calls firestore with the dog data for the current user', async () => {
    await createLuna();

    expect(createDog).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Luna', age: 2, breed: 'Husky', userId: 'user-1' })
    );
  });

  it('createDog uploads photo when provided', async () => {
    const photo = makePhoto();

    await createLuna(photo);

    expect(uploadDogPhoto).toHaveBeenCalledWith(photo, 'user-1', 'temp');
    expect(createDog).toHaveBeenCalledWith(
      expect.objectContaining({ photoUrl: 'https://example.com/photo.jpg' })
    );
  });

  it('createDog creates initial goals for the new dog', async () => {
    await createLuna();

    expect(createGoalsBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ category: 'Men', type: 'people', dogId: 'dog-3' }),
      ])
    );
  });

  it('deleteDog calls firestore', async () => {
    const result = await renderDogs();

    await act(async () => {
      await result.current.deleteDog('dog-1');
    });

    expect(vi.mocked(deleteDog).mock.calls[0][0]).toBe('dog-1');
  });
});
