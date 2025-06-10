
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Budget } from '@/types/budget';

interface DeleteBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  budget: Budget | null;
  isLoading?: boolean;
}

export const DeleteBudgetDialog: React.FC<DeleteBudgetDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  budget,
  isLoading = false,
}) => {
  if (!budget) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{budget.name}"? This action cannot be undone.
            Any expenses linked to this budget will remain but will no longer be tracked against it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Budget
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
