import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecurringPlanWithComputed } from '@/types/recurringPlan';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';

interface MarkAsPaidDialogProps {
  plan: RecurringPlanWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bankAccountId: string) => void;
  isLoading: boolean;
}

export const MarkAsPaidDialog: React.FC<MarkAsPaidDialogProps> = ({
  plan, isOpen, onClose, onConfirm, isLoading,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const { bankAccounts } = useBankAccounts();

  useEffect(() => {
    if (isOpen && plan?.bank_account_id) {
      setSelectedBankId(plan.bank_account_id);
    }
  }, [isOpen, plan?.bank_account_id]);

  const handleConfirm = () => {
    if (selectedBankId) {
      onConfirm(selectedBankId);
      setSelectedBankId('');
    }
  };

  if (!plan) return null;

  const currencySymbol = plan.currency === 'INR' ? '₹' : '$';
  const dueDate = parseLocalDate(plan.next_due_date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-semibold">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold text-lg">{currencySymbol}{plan.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date:</span>
            <span>{format(dueDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <Label>Payment Source <span className="text-destructive">*</span></Label>
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger><SelectValue placeholder="Select bank account" /></SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedBankId || isLoading}>
            {isLoading ? 'Marking...' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
