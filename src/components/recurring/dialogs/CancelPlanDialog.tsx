import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RecurringPlanWithComputed } from '@/types/recurringPlan';
import { AlertTriangle } from 'lucide-react';

interface CancelPlanDialogProps {
  plan: RecurringPlanWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const CancelPlanDialog: React.FC<CancelPlanDialogProps> = ({
  plan, isOpen, onClose, onConfirm, isLoading,
}) => {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Cancel Recurring Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel "{plan.name}"? No new payments will be scheduled. Your payment history will be preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Keep Plan</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Cancelling...' : 'Cancel Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
