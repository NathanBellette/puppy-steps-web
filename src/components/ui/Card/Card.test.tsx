import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './Card';
import { expectTexts, itAcceptsClassNameAndRef, itRendersChildren } from '@/test/utils';

describe('Card Components', () => {
  itRendersChildren(
    { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter },
    { CardTitle: 'H3', CardDescription: 'P' }
  );

  describe('Card', () => {
    itAcceptsClassNameAndRef((props) => <Card data-testid="card" {...props}>Content</Card>, 'card');
  });

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expectTexts('Test Card', 'This is a test card description', 'This is the main content of the card.');
      expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
    });
  });
});
