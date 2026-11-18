import { screen } from '@testing-library/react';
import { Sessions } from './Sessions';
import { useDogs } from '@/hooks/useDogProfile';
import { useSessions } from '@/hooks/useSessions';
import { Dog, Session } from '@/types';
import { makeDogsState, makeSession } from '@/test/fixtures';
import { clickButton, expectButtons, expectLoadingSkeletons, expectTexts, renderWithRouter, stubHook } from '@/test/utils';

// --- Mocks ---

vi.mock('@/hooks/useDogProfile');
vi.mock('@/hooks/useSessions');

const mockShowToast = vi.fn();
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockDeleteSession = vi.fn();

// --- Helpers ---

const singleMenSession = [makeSession({ id: 's1', type: 'people', category: 'Men' })];

function renderSessions(overrides?: { selectedDog?: Dog | null; sessions?: Session[]; isLoading?: boolean }) {
  stubHook(useDogs, makeDogsState(overrides?.selectedDog));
  stubHook(useSessions, {
    sessions: overrides?.sessions ?? [
      makeSession({ id: 's1', type: 'people', category: 'Men' }),
      makeSession({ id: 's2', type: 'dogs', category: 'Small Dogs' }),
      makeSession({ id: 's3', type: 'environments', category: 'Park' }),
    ],
    isLoading: overrides?.isLoading ?? false,
    deleteSession: mockDeleteSession,
    isDeleting: false,
  });

  return renderWithRouter(<Sessions />);
}

// --- Tests ---

describe('Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { scenario: 'renders the session log heading with dog name', texts: ['Session Log', /Buddy's socialisation sessions/] },
    { scenario: 'renders the Log Session button', buttons: [/log session/i] },
    { scenario: 'renders type filter pills including All', buttons: [/all/i, /people/i, /dogs/i, /environments/i, /noises/i] },
    { scenario: 'shows all sessions by default', texts: ['All Sessions', '3 sessions'] },
  ])('$scenario', ({ texts = [], buttons = [] }) => {
    renderSessions();

    expectTexts(...texts);
    expectButtons(...buttons);
  });

  it('renders empty state when no dog is selected', () => {
    renderSessions({ selectedDog: null });

    expectTexts('No Dog Selected');
  });

  it('navigates to /log-exposure when Log Session button is clicked', async () => {
    renderSessions();

    await clickButton(/log session/i);

    expect(mockNavigate).toHaveBeenCalledWith('/log-exposure');
  });

  it('filters sessions when a type filter is clicked', async () => {
    renderSessions();

    await clickButton(/people/i);

    expectTexts('People Sessions', /1 session/, /filtered/);
  });

  it('shows loading skeletons when loading', () => {
    expectLoadingSkeletons(renderSessions({ isLoading: true }).container);
  });

  it('shows empty state when no sessions exist', () => {
    renderSessions({ sessions: [] });

    expectTexts('No sessions logged yet');
    expectButtons(/log your first session/i);
  });

  it('shows filtered empty state when filter has no matches', async () => {
    renderSessions({ sessions: singleMenSession });

    await clickButton(/noises/i);

    expectTexts('No noises sessions yet');
  });

  it('shows delete confirmation modal when session delete is triggered', async () => {
    renderSessions({ sessions: singleMenSession });

    // SessionItem renders a trash icon button with aria-label="Delete session"
    await clickButton(/delete session/i);

    // The Modal component opens with a dialog role, showing Delete and Cancel buttons
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expectTexts(/are you sure you want to delete/i);
    expectButtons(/^delete$/i, /cancel/i);
  });

  it('calls deleteSession and shows toast on confirm delete', async () => {
    mockDeleteSession.mockResolvedValue(undefined);
    renderSessions({ sessions: singleMenSession });

    // Trigger the delete via SessionItem's trash icon, then confirm in the modal
    await clickButton(/delete session/i);
    await clickButton(/^delete$/i);

    expect(mockDeleteSession).toHaveBeenCalledWith('s1');
    expect(mockShowToast).toHaveBeenCalledWith('Session deleted', 'success');
  });
});
