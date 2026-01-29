/**
 * =====================================================
 * ADD PLAN DIALOG
 * =====================================================
 * 
 * Dialog for creating a new recurring payment plan.
 * Opens from the "Add Transaction" button on the Recurring page.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { useRecurringPlans } from '@/hooks/useRecurringPlans';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { RecurringPlanFormData } from '@/types/recurringPlan';
import { ExpenseCategory, CURRENCIES } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Categories matching the ExpenseCategory type
const CATEGORIES: ExpenseCategory[] = ['Groceries', 'Food', 'Travel', 'Bills', 'Others'];

interface AddPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const AddPlanDialog: React.FC<AddPlanDialogProps> = ({ isOpen, onClose }) => {
  const { createPlan, isCreating } = useRecurringPlans();
  const { bankAccounts } = useBankAccounts();
  const { toast } = useToast();

  const [formData, setFormData] = useState<RecurringPlanFormData>({
    name: '',
    amount: 0,
    category: 'Others',
    frequency: 'monthly',
    next_due_date: format(new Date(), 'yyyy-MM-dd'),
    currency: 'USD',
    email_reminder: true,
    reminder_days_before: 2,
    bank_account_id: '',
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        amount: 0,
        category: 'Others',
        frequency: 'monthly',
        next_due_date: format(new Date(), 'yyyy-MM-dd'),
        currency: 'USD',
        email_reminder: true,
        reminder_days_before: 2,
        bank_account_id: bankAccounts[0]?.id || '',
      });
    }
  }, [isOpen, bankAccounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the recurring transaction.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.bank_account_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a bank account.',
        variant: 'destructive',
      });
      return;
    }

    createPlan(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recurring Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Netflix, Gym Membership"
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  frequency: value as 'daily' | 'weekly' | 'monthly' | 'yearly',
                })
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Next Due Date */}
          <div className="space-y-2">
            <Label htmlFor="next_due_date">Next Due Date *</Label>
            <Input
              id="next_due_date"
              type="date"
              value={formData.next_due_date}
              onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
            />
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label htmlFor="bank_account">Bank Account *</Label>
            <Select
              value={formData.bank_account_id}
              onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
            >
              <SelectTrigger id="bank_account">
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.account_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Reminder */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="email_reminder">Email Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified before payments are due
              </p>
            </div>
            <Switch
              id="email_reminder"
              checked={formData.email_reminder}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, email_reminder: checked })
              }
            />
          </div>

          {/* Reminder Days Before */}
          {formData.email_reminder && (
            <div className="space-y-2">
              <Label htmlFor="reminder_days">Remind me (days before)</Label>
              <Select
                value={formData.reminder_days_before.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, reminder_days_before: parseInt(value) })
                }
              >
                <SelectTrigger id="reminder_days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="2">2 days before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="5">5 days before</SelectItem>
                  <SelectItem value="7">7 days before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
