import { render, screen } from '@testing-library/react';
import { Progress, CircularProgress, CircularProgressProps } from './Progress';
import { expectAttributes, expectTexts, itAcceptsClassNameAndRef } from '@/test/utils';

describe('Progress Components', () => {
  describe.each([
    {
      name: 'Progress',
      ProgressComponent: Progress,
      testId: 'progress',
      // The bar slides left by the unfilled share
      expectPercentage: (percent: number) =>
        expect(screen.getByTestId('progress').querySelector('div')).toHaveStyle(`transform: translateX(-${100 - percent}%)`),
    },
    {
      name: 'CircularProgress',
      ProgressComponent: CircularProgress,
      testId: 'circular-progress',
      expectPercentage: (percent: number) => expectTexts(`${percent}%`),
    },
  ])('$name', ({ ProgressComponent, testId, expectPercentage }) => {
    it('renders without crashing', () => {
      render(<ProgressComponent value={50} data-testid={testId} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('supports accessibility attributes', () => {
      render(<ProgressComponent value={50} role="progressbar" aria-valuenow={50} aria-valuemax={100} data-testid={testId} />);
      expectAttributes(screen.getByTestId(testId), { role: 'progressbar', 'aria-valuenow': '50', 'aria-valuemax': '100' });
    });

    it.each([
      { scenario: 'defaults to max of 100', value: 50, max: undefined, percent: 50 },
      { scenario: 'shows the percentage for the value', value: 75, max: undefined, percent: 75 },
      { scenario: 'handles different max values', value: 25, max: 50, percent: 50 },
      // Values outside 0-100% are clamped
      { scenario: 'clamps negative values to 0%', value: -10, max: undefined, percent: 0 },
      { scenario: 'clamps values above max to 100%', value: 150, max: undefined, percent: 100 },
    ])('$scenario', ({ value, max, percent }) => {
      render(<ProgressComponent value={value} max={max} data-testid={testId} />);
      expectPercentage(percent);
    });

    itAcceptsClassNameAndRef((props) => <ProgressComponent value={50} data-testid={testId} {...props} />, testId);
  });

  describe('CircularProgress', () => {
    const renderCircular = (props: Partial<CircularProgressProps>) => {
      render(<CircularProgress value={50} data-testid="circular-progress" {...props} />);
      return screen.getByTestId('circular-progress');
    };

    it('renders with correct explicit size', () => {
      expect(renderCircular({ size: 100 })).toHaveStyle('width: 100px; height: 100px');
    });

    it('rounds percentage to nearest integer', () => {
      renderCircular({ value: 33.7 });
      expectTexts('34%');
    });

    it('hides percentage text when showPercentage is false', () => {
      renderCircular({ value: 75, showPercentage: false });
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('renders SVG with correct dimensions', () => {
      expectAttributes(renderCircular({ size: 120 }).querySelector('svg'), { width: '120', height: '120' });
    });

    it('renders background and progress circles with the given stroke width', () => {
      const circles = renderCircular({ strokeWidth: 12 }).querySelectorAll('circle');
      expect(circles).toHaveLength(2);
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '12');
      });
    });
  });
});
