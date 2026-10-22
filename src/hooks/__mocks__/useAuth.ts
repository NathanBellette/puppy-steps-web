import { testUser } from '@/test/fixtures';

export const useAuth = vi.fn(() => ({ user: testUser }));
