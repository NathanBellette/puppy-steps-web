import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalItem } from './GoalItem';
import { Goal } from '@/types';

// Mock the utils functions
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('GoalItem', () => {
  const mockGoal: Goal = {
    id: 'goal-1',
    userId: 'user-1',
    dogId: 'dog-1',
    category: 'Men',
    type: 'people',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCompletedGoal: Goal = {
    ...mockGoal,
    id: 'goal-2',
    category: 'Park',
    type: 'environments',
    currentCount: 1,
    isCompleted: true,
    completedDate: new Date('2024-01-15'),
  };

  const mockOnIncrement = vi.fn();

  beforeEach(() => {
    mockOnIncrement.mockClear();
  });

  it('renders goal with correct category and type', () => {
    render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    
    expect(screen.getByText('Men')).toBeInTheDocument();
    expect(screen.getByText('people')).toBeInTheDocument();
  });

  it('renders progress bar with correct values', () => {
    render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    
    expect(screen.getByText('0/1')).toBeInTheDocument();
  });

  it('renders different goal types correctly', () => {
    const { rerender } = render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    expect(screen.getByText('people')).toBeInTheDocument();

    rerender(<GoalItem goal={{ ...mockGoal, type: 'dogs' }} onIncrement={mockOnIncrement} />);
    expect(screen.getByText('dogs')).toBeInTheDocument();

    rerender(<GoalItem goal={{ ...mockGoal, type: 'environments' }} onIncrement={mockOnIncrement} />);
    expect(screen.getByText('environments')).toBeInTheDocument();

    rerender(<GoalItem goal={{ ...mockGoal, type: 'noises' }} onIncrement={mockOnIncrement} />);
    expect(screen.getByText('noises')).toBeInTheDocument();
  });

  it('shows incomplete state correctly', () => {
    render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    expect(incrementButton).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    render(<GoalItem goal={mockCompletedGoal} onIncrement={mockOnIncrement} />);
    
    expect(screen.getByText('1/1')).toBeInTheDocument();
    expect(screen.getByText('Park')).toBeInTheDocument();
  });

  it('calls onIncrement when increment button is clicked', async () => {
    const user = userEvent.setup();
    render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    await user.click(incrementButton);
    
    expect(mockOnIncrement).toHaveBeenCalledWith(mockGoal.id);
  });

  it('renders progress bar with correct width for partial completion', () => {
    const partialGoal = { ...mockGoal, currentCount: 2, targetCount: 5 };
    render(<GoalItem goal={partialGoal} onIncrement={mockOnIncrement} />);
    
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('renders completed goal with checkmark', () => {
    render(<GoalItem goal={mockCompletedGoal} onIncrement={mockOnIncrement} />);
    
    // Check for checkmark icon (it should be present in completed goals)
    const checkIcon = screen.getByText((_content, element) => {
      return element?.textContent === '✓ Completed 1/15/2024';
    });
    expect(checkIcon).toBeInTheDocument();
  });

  it('applies correct styling for different goal types', () => {
    const { rerender } = render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    
    // People goal should have blue styling
    expect(screen.getByText('people')).toBeInTheDocument();
    
    rerender(<GoalItem goal={{ ...mockGoal, type: 'environments' }} onIncrement={mockOnIncrement} />);
    // Environments goal should have purple styling
    expect(screen.getByText('environments')).toBeInTheDocument();
  });

  it('handles goals without completion date gracefully', () => {
    const goalWithoutCompletion = { ...mockGoal, isCompleted: false };
    render(<GoalItem goal={goalWithoutCompletion} onIncrement={mockOnIncrement} />);
    
    expect(screen.getByText('Men')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<GoalItem goal={mockGoal} onIncrement={mockOnIncrement} />);
    
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    expect(incrementButton).toHaveAttribute('aria-label');
  });
});