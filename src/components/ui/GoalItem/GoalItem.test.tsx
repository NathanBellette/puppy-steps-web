import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalItem } from './GoalItem';
import { Goal } from '@/types';
import { TargetProgress } from '@/services/targetProgress';

describe('GoalItem', () => {
  const mockGoal: Goal = {
    id: 'goal-1',
    userId: 'user-1',
    dogId: 'dog-1',
    category: 'Men',
    type: 'people',
    calmTargetCount: 5,
    varietyTargetCount: 3,
    targetCount: 5,
    currentCount: 0,
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProgress: TargetProgress = {
    goalId: 'goal-1',
    category: 'Men',
    type: 'people',
    calmCount: 2,
    calmTarget: 5,
    varietyCount: 1,
    varietyTarget: 3,
    isComplete: false,
    lastLogged: new Date('2024-01-10'),
    varietyKeys: new Set(['context:Park:low']),
  };

  const mockCompletedGoal: Goal = {
    ...mockGoal,
    id: 'goal-2',
    category: 'Park',
    type: 'environments',
    isCompleted: true,
    completedDate: new Date('2024-01-15'),
  };

  const mockCompletedProgress: TargetProgress = {
    goalId: 'goal-2',
    category: 'Park',
    type: 'environments',
    calmCount: 5,
    calmTarget: 5,
    varietyCount: 3,
    varietyTarget: 3,
    isComplete: true,
    lastLogged: new Date('2024-01-15'),
    varietyKeys: new Set(['context:Park:low', 'context:Park:medium', 'context:Street:low']),
  };

  const mockOnLogExposure = vi.fn();

  beforeEach(() => {
    mockOnLogExposure.mockClear();
  });

  it('renders goal with correct category and type', () => {
    render(<GoalItem goal={mockGoal} progress={mockProgress} onLogExposure={mockOnLogExposure} />);
    
    expect(screen.getByText('Men')).toBeInTheDocument();
    expect(screen.getByText('people')).toBeInTheDocument();
  });

  it('renders dual progress bars with correct values', () => {
    render(<GoalItem goal={mockGoal} progress={mockProgress} onLogExposure={mockOnLogExposure} />);
    
    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('Calm')).toBeInTheDocument();
    expect(screen.getByText('Variety')).toBeInTheDocument();
  });

  it('renders different goal types correctly', () => {
    const { rerender } = render(<GoalItem goal={mockGoal} progress={mockProgress} onLogExposure={mockOnLogExposure} />);
    expect(screen.getByText('people')).toBeInTheDocument();

    rerender(<GoalItem goal={{ ...mockGoal, type: 'dogs' }} progress={{ ...mockProgress, type: 'dogs' }} onLogExposure={mockOnLogExposure} />);
    expect(screen.getByText('dogs')).toBeInTheDocument();

    rerender(<GoalItem goal={{ ...mockGoal, type: 'environments' }} progress={{ ...mockProgress, type: 'environments' }} onLogExposure={mockOnLogExposure} />);
    expect(screen.getByText('environments')).toBeInTheDocument();

    rerender(<GoalItem goal={{ ...mockGoal, type: 'noises' }} progress={{ ...mockProgress, type: 'noises' }} onLogExposure={mockOnLogExposure} />);
    expect(screen.getByText('noises')).toBeInTheDocument();
  });

  it('shows Log Exposure button for incomplete goals', () => {
    render(<GoalItem goal={mockGoal} progress={mockProgress} onLogExposure={mockOnLogExposure} />);
    
    const logButton = screen.getByRole('button', { name: /log exposure/i });
    expect(logButton).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    render(<GoalItem goal={mockCompletedGoal} progress={mockCompletedProgress} onLogExposure={mockOnLogExposure} />);
    
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('3/3')).toBeInTheDocument();
    expect(screen.getByText('Park')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('calls onLogExposure when Log Exposure button is clicked', async () => {
    const user = userEvent.setup();
    render(<GoalItem goal={mockGoal} progress={mockProgress} onLogExposure={mockOnLogExposure} />);
    
    const logButton = screen.getByRole('button', { name: /log exposure/i });
    await user.click(logButton);
    
    expect(mockOnLogExposure).toHaveBeenCalledWith('people', 'Men');
  });

  it('does not show Log Exposure button for completed goals', () => {
    render(<GoalItem goal={mockCompletedGoal} progress={mockCompletedProgress} onLogExposure={mockOnLogExposure} />);
    
    expect(screen.queryByRole('button', { name: /log exposure/i })).not.toBeInTheDocument();
  });

  it('shows "No exposures yet" when no progress', () => {
    const noProgress: TargetProgress = {
      ...mockProgress,
      calmCount: 0,
      varietyCount: 0,
      lastLogged: null,
      varietyKeys: new Set(),
    };
    render(<GoalItem goal={mockGoal} progress={noProgress} onLogExposure={mockOnLogExposure} />);
    
    expect(screen.getByText('No exposures yet. Start small.')).toBeInTheDocument();
  });

  it('shows status text when provided', () => {
    render(
      <GoalItem
        goal={mockGoal}
        progress={mockProgress}
        onLogExposure={mockOnLogExposure}
        statusText="Try a new context (cafe, park)"
      />
    );
    
    expect(screen.getByText('Try a new context (cafe, park)')).toBeInTheDocument();
  });

  it('applies correct styling for completed goals', () => {
    render(<GoalItem goal={mockCompletedGoal} progress={mockCompletedProgress} />);
    
    expect(screen.getByText('Park')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });
});
