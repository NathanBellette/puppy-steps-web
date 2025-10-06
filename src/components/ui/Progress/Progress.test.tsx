import { render, screen } from '@testing-library/react';
import { Progress, CircularProgress } from './Progress';

describe('Progress Components', () => {
  describe('Progress', () => {
    it('renders with default props', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveClass('relative', 'h-2', 'w-full', 'overflow-hidden', 'rounded-full');
    });

    it('renders with correct percentage for value', () => {
      render(<Progress value={75} data-testid="progress" />);
      const progressBar = screen.getByTestId('progress').querySelector('div');
      expect(progressBar).toHaveStyle('transform: translateX(-25%)');
    });

    it('handles different max values', () => {
      render(<Progress value={25} max={50} data-testid="progress" />);
      const progressBar = screen.getByTestId('progress').querySelector('div');
      expect(progressBar).toHaveStyle('transform: translateX(-50%)');
    });

    it('clamps value to 0-100% range', () => {
      const { rerender } = render(<Progress value={-10} data-testid="progress" />);
      let progressBar = screen.getByTestId('progress').querySelector('div');
      expect(progressBar).toHaveStyle('transform: translateX(-100%)');

      rerender(<Progress value={150} data-testid="progress" />);
      progressBar = screen.getByTestId('progress').querySelector('div');
      expect(progressBar).toHaveStyle('transform: translateX(-0%)');
    });

    it('defaults to max of 100', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progressBar = screen.getByTestId('progress').querySelector('div');
      expect(progressBar).toHaveStyle('transform: translateX(-50%)');
    });

    it('applies custom className', () => {
      render(<Progress value={50} className="custom-class" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Progress value={50} ref={ref} data-testid="progress" />);
      expect(ref).toHaveBeenCalled();
    });

    it('has proper accessibility attributes', () => {
      render(<Progress value={50} role="progressbar" aria-valuenow={50} aria-valuemax={100} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('role', 'progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('CircularProgress', () => {
    it('renders with default props', () => {
      render(<CircularProgress value={50} data-testid="circular-progress" />);
      const circularProgress = screen.getByTestId('circular-progress');
      expect(circularProgress).toBeInTheDocument();
      expect(circularProgress).toHaveClass('relative', 'inline-flex', 'items-center', 'justify-center');
    });

    it('renders with correct size', () => {
      render(<CircularProgress value={50} size={100} data-testid="circular-progress" />);
      const circularProgress = screen.getByTestId('circular-progress');
      expect(circularProgress).toHaveStyle('width: 100px; height: 100px');
    });

    it('shows percentage text by default', () => {
      render(<CircularProgress value={75} data-testid="circular-progress" />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hides percentage text when showPercentage is false', () => {
      render(<CircularProgress value={75} showPercentage={false} data-testid="circular-progress" />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('renders SVG with correct dimensions', () => {
      render(<CircularProgress value={50} size={120} data-testid="circular-progress" />);
      const svg = screen.getByTestId('circular-progress').querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('renders background and progress circles', () => {
      render(<CircularProgress value={50} data-testid="circular-progress" />);
      const circles = screen.getByTestId('circular-progress').querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('handles different stroke widths', () => {
      render(<CircularProgress value={50} strokeWidth={12} data-testid="circular-progress" />);
      const circles = screen.getByTestId('circular-progress').querySelectorAll('circle');
      circles.forEach(circle => {
        expect(circle).toHaveAttribute('stroke-width', '12');
      });
    });

    it('clamps value to 0-100% range', () => {
      const { rerender } = render(<CircularProgress value={-10} data-testid="circular-progress" />);
      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<CircularProgress value={150} data-testid="circular-progress" />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles different max values', () => {
      render(<CircularProgress value={25} max={50} data-testid="circular-progress" />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CircularProgress value={50} className="custom-class" data-testid="circular-progress" />);
      const circularProgress = screen.getByTestId('circular-progress');
      expect(circularProgress).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<CircularProgress value={50} ref={ref} data-testid="circular-progress" />);
      expect(ref).toHaveBeenCalled();
    });

    it('rounds percentage to nearest integer', () => {
      render(<CircularProgress value={33.7} data-testid="circular-progress" />);
      expect(screen.getByText('34%')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(
        <CircularProgress 
          value={50} 
          role="progressbar" 
          aria-valuenow={50} 
          aria-valuemax={100} 
          data-testid="circular-progress" 
        />
      );
      const circularProgress = screen.getByTestId('circular-progress');
      expect(circularProgress).toHaveAttribute('role', 'progressbar');
      expect(circularProgress).toHaveAttribute('aria-valuenow', '50');
      expect(circularProgress).toHaveAttribute('aria-valuemax', '100');
    });
  });
});
