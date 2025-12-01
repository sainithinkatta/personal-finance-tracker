import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RecurringTransaction } from '@/types/recurringTransaction';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';

interface MarkAsDoneDialogProps {
  transaction: RecurringTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, bankAccountId: string) => void;
  isLoading: boolean;
}

export const MarkAsDoneDialog: React.FC<MarkAsDoneDialogProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const { bankAccounts } = useBankAccounts();

  const handleConfirm = () => {
    if (!transaction || !selectedBankId) return;
    onConfirm(transaction.id, selectedBankId);
    setSelectedBankId('');
    onClose();
  };

  const handleClose = () => {
    setSelectedBankId('');
    onClose();
  };

  if (!transaction) return null;

  const currencyInfo = CURRENCIES.find((c) => c.code === transaction.currency);
  const dueDate = parseLocalDate(transaction.next_due_date);
  const dayOfMonth = format(dueDate, 'd');
  const dueDateLabel = `Due around: ${dayOfMonth}${getDaySuffix(parseInt(dayOfMonth))} of each month`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Transaction as Done</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-semibold">{transaction.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-semibold text-lg">
                {currencyInfo?.symbol || transaction.currency}
                {transaction.amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Due Date:</span>
              <span className="font-medium">{dueDateLabel}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className="bg-warning-muted text-warning-foreground">
                {transaction.status === 'pending' ? 'Pending' : 'Done'}
              </Badge>
            </div>
          </div>

          {/* Bank Account Selection */}
          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="bank-account" className="text-sm font-medium">
              Payment Source <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger id="bank-account">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{account.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({account.account_type})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select which bank account was used for this payment
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedBankId || isLoading}
          >
            {isLoading ? 'Marking...' : 'Confirm & Mark as Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
