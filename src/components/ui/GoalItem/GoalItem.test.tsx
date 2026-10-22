import { render } from '@testing-library/react';
import { GoalItem, GoalItemProps } from './GoalItem';
import { SessionType } from '@/types';
import { makeGoal, makeProgress } from '@/test/fixtures';
import { clickButton, expectButtons, expectNoButton, expectTexts } from '@/test/utils';

describe('GoalItem', () => {
  const mockOnLogExposure = vi.fn();

  const completedGoalProps = {
    goal: makeGoal({
      id: 'goal-2',
      category: 'Park',
      type: 'environments',
      isCompleted: true,
      completedDate: new Date('2024-01-15'),
    }),
    progress: makeProgress({
      goalId: 'goal-2',
      category: 'Park',
      type: 'environments',
      calmCount: 5,
      varietyCount: 3,
      isComplete: true,
      lastLogged: new Date('2024-01-15'),
      varietyKeys: new Set(['context:Park:low', 'context:Park:medium', 'context:Street:low']),
    }),
  };

  const renderGoalItem = (props: Partial<GoalItemProps> = {}) =>
    render(<GoalItem goal={makeGoal()} progress={makeProgress()} onLogExposure={mockOnLogExposure} {...props} />);

  beforeEach(() => {
    mockOnLogExposure.mockClear();
  });

  it('renders goal with correct category and type', () => {
    renderGoalItem();
    expectTexts('Men', 'people');
  });

  it('renders dual progress bars with correct values', () => {
    renderGoalItem();
    expectTexts('2/5', '1/3', 'Calm', 'Variety');
  });

  it.each<SessionType>(['people', 'dogs', 'environments', 'noises'])('renders %s goal type', (type) => {
    renderGoalItem({ goal: makeGoal({ type }), progress: makeProgress({ type }) });
    expectTexts(type);
  });

  it('shows Log Exposure button for incomplete goals', () => {
    renderGoalItem();
    expectButtons(/log exposure/i);
  });

  it('calls onLogExposure when Log Exposure button is clicked', async () => {
    renderGoalItem();

    await clickButton(/log exposure/i);

    expect(mockOnLogExposure).toHaveBeenCalledWith('people', 'Men');
  });

  it('shows completed state correctly', () => {
    renderGoalItem(completedGoalProps);

    expectTexts('5/5', '3/3', 'Park', 'Complete');
    expectNoButton(/log exposure/i);
  });

  it('shows the completed badge without a log handler', () => {
    renderGoalItem({ ...completedGoalProps, onLogExposure: undefined });

    expectTexts('Park', 'Complete');
  });

  it('shows "No exposures yet" when no progress', () => {
    renderGoalItem({
      progress: makeProgress({ calmCount: 0, varietyCount: 0, lastLogged: null, varietyKeys: new Set() }),
    });

    expectTexts('No exposures yet. Start small.');
  });

  it('shows status text when provided', () => {
    renderGoalItem({ statusText: 'Try a new context (cafe, park)' });

    expectTexts('Try a new context (cafe, park)');
  });
});
