import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/** Asks the user to confirm a delete that cannot be undone. */
export const ConfirmDeleteModal = ({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  isDeleting = false,
}: ConfirmDeleteModalProps) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title}>
    <div className="space-y-4">
      <p className="text-slate-600 dark:text-slate-400">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="flex-1">
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  </Modal>
);
