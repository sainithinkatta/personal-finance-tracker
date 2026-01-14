import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RecurringPlanWithComputed } from '@/types/recurringPlan';
import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { SkipForward } from 'lucide-react';

interface SkipOccurrenceDialogProps {
  plan: RecurringPlanWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const SkipOccurrenceDialog: React.FC<SkipOccurrenceDialogProps> = ({
  plan, isOpen, onClose, onConfirm, isLoading,
}) => {
  if (!plan) return null;

  const dueDate = parseLocalDate(plan.next_due_date);
  const currencySymbol = plan.currency === 'INR' ? '₹' : '$';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SkipForward className="h-5 w-5" />
            Skip This Occurrence
          </DialogTitle>
          <DialogDescription>
            Skip the payment for {format(dueDate, 'MMM d, yyyy')} and move to the next scheduled date.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <p><strong>{plan.name}</strong></p>
          <p className="text-muted-foreground">{currencySymbol}{plan.amount.toFixed(2)} • {plan.frequency}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="secondary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Skipping...' : 'Skip & Advance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
