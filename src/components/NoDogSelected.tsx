import { ReactNode } from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

interface NoDogSelectedProps {
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Extra content rendered alongside the card, e.g. a modal opened by the action */
  children?: ReactNode;
}

/** Full-page empty state for pages that need a selected dog. */
export const NoDogSelected = ({ description, actionLabel, onAction, children }: NoDogSelectedProps) => (
  <div className="flex items-center justify-center min-h-96">
    <Card className="w-full max-w-md">
      <CardContent className="text-center py-8">
        <EmptyState
          icon={Target}
          title="No Dog Selected"
          description={description}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </CardContent>
    </Card>
    {children}
  </div>
);
