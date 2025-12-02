import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RecurringTransaction, RecurringTransactionFormData } from '@/types/recurringTransaction';
import { CURRENCIES, ExpenseCategory } from '@/types/expense';
import { useBankAccounts } from '@/hooks/useBankAccounts';

interface EditRecurringTransactionFormProps {
  transaction: RecurringTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<RecurringTransactionFormData>) => void;
  isLoading: boolean;
}

export const EditRecurringTransactionForm: React.FC<EditRecurringTransactionFormProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const { bankAccounts } = useBankAccounts();
  const [formData, setFormData] = useState<RecurringTransactionFormData & { status?: 'pending' | 'done' }>({
    name: '',
    amount: 0,
    category: 'Bills' as ExpenseCategory,
    frequency: 'monthly',
    next_due_date: '',
    currency: 'USD',
    email_reminder: true,
    reminder_days_before: 2,
    bank_account_id: '',
    status: 'pending',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        amount: transaction.amount,
        category: transaction.category,
        frequency: transaction.frequency,
        next_due_date: transaction.next_due_date,
        currency: transaction.currency,
        email_reminder: transaction.email_reminder,
        reminder_days_before: transaction.reminder_days_before,
        bank_account_id: transaction.bank_account_id || '',
        status: transaction.status,
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction) {
      onSave(transaction.id, formData);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto my-8 overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Recurring Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Netflix"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-amount" className="text-sm font-medium">
              Amount
            </Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-currency" className="text-sm font-medium">
              Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(val) =>
                setFormData({ ...formData, currency: val })
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="USD" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-sm">
                    {c.symbol} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(val) =>
                setFormData({ ...formData, category: val as ExpenseCategory })
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Bills" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectItem value="Groceries" className="text-sm">
                  Groceries
                </SelectItem>
                <SelectItem value="Food" className="text-sm">
                  Food
                </SelectItem>
                <SelectItem value="Travel" className="text-sm">
                  Travel
                </SelectItem>
                <SelectItem value="Bills" className="text-sm">
                  Bills
                </SelectItem>
                <SelectItem value="Others" className="text-sm">
                  Others
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-frequency" className="text-sm font-medium">
              Frequency
            </Label>
            <Select
              value={formData.frequency}
              onValueChange={(val: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
                setFormData({ ...formData, frequency: val })
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectItem value="daily" className="text-sm">
                  Daily
                </SelectItem>
                <SelectItem value="weekly" className="text-sm">
                  Weekly
                </SelectItem>
                <SelectItem value="monthly" className="text-sm">
                  Monthly
                </SelectItem>
                <SelectItem value="yearly" className="text-sm">
                  Yearly
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-next_due_date" className="text-sm font-medium">
              Next Due Date
            </Label>
            <Input
              id="edit-next_due_date"
              type="date"
              value={formData.next_due_date}
              onChange={(e) =>
                setFormData({ ...formData, next_due_date: e.target.value })
              }
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-bank_account_id" className="text-sm font-medium">
              Bank Account <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.bank_account_id}
              onValueChange={(val) => setFormData({ ...formData, bank_account_id: val })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="text-sm">
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="edit-reminder_days_before"
              className="text-sm font-medium"
            >
              Remind (days before)
            </Label>
            <Input
              id="edit-reminder_days_before"
              type="number"
              min="0"
              max="30"
              value={formData.reminder_days_before}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reminder_days_before: parseInt(e.target.value) || 0,
                })
              }
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val: 'pending' | 'done') =>
                setFormData({ ...formData, status: val })
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectItem value="pending" className="text-sm">
                  Pending
                </SelectItem>
                <SelectItem value="done" className="text-sm">
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" size="sm" disabled={isLoading}>
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
