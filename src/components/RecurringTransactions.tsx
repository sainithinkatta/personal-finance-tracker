import React, { useState, useEffect } from 'react';
import { Plus, Bell, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { RecurringTransaction, RecurringTransactionFormData } from '@/types/recurringTransaction';
import { CURRENCIES, ExpenseCategory } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { RecurringTransactionCard } from '@/components/recurring/RecurringTransactionCard';
import { EditRecurringTransactionForm } from '@/components/recurring/EditRecurringTransactionForm';

const RecurringTransactions: React.FC = () => {
  const {
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    markAsDone,
    getUpcomingReminders,
    processRecurringTransactions,
    isAdding,
    isUpdating,
    isMarkingDone,
  } = useRecurringTransactions();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState<RecurringTransactionFormData>({
    name: '',
    amount: 0,
    category: 'Bills' as ExpenseCategory,
    frequency: 'monthly',
    next_due_date: '',
    currency: 'USD',
    email_reminder: true,
    reminder_days_before: 2,
  });

  // Filter out transactions that are marked as 'done' from upcoming reminders
  const upcomingReminders = getUpcomingReminders().filter(tx => tx.status !== 'done');

  useEffect(() => {
    processRecurringTransactions();
    upcomingReminders.forEach((tx) => {
      const daysUntilDue = differenceInDays(
        new Date(tx.next_due_date),
        new Date()
      );
      if (daysUntilDue <= tx.reminder_days_before && daysUntilDue >= 0) {
        toast({
          title: 'Upcoming Reminder',
          description: `${tx.name} — ${formatCurrency(
            tx.amount,
            tx.currency
          )} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      category: 'Bills' as ExpenseCategory,
      frequency: 'monthly',
      next_due_date: '',
      currency: 'USD',
      email_reminder: true,
      reminder_days_before: 2,
    });
    setIsAddDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecurringTransaction(formData);
    resetForm();
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = (id: string, data: Partial<RecurringTransactionFormData>) => {
    updateRecurringTransaction({ id, data });
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    deleteRecurringTransaction(id);
  };

  const handleMarkAsDone = (id: string) => {
    markAsDone(id);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find((c) => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
  };

  const getFrequencyBadgeColor = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      case 'yearly':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Upcoming Reminders Notification */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Upcoming Payments</h3>
          </div>
          
          <div className="grid gap-2">
            {upcomingReminders.map((tx) => {
              const daysUntilDue = differenceInDays(
                new Date(tx.next_due_date),
                new Date()
              );
              const dueLabel =
                daysUntilDue === 0
                  ? 'Today'
                  : daysUntilDue === 1
                  ? 'Tomorrow'
                  : `${daysUntilDue} days`;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-white rounded-md border border-yellow-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{tx.name}</p>
                      <p className="text-xs text-gray-600">
                        Due {format(new Date(tx.next_due_date), 'MMM d')} • {dueLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <Badge 
                        className={`text-xs ${getFrequencyBadgeColor(tx.frequency)}`}
                      >
                        {tx.frequency}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recurring Transactions List */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex bg-blue-500 hover:bg-blue-600 text-white shadow-lg ml-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto my-8 overflow-auto">
              <DialogHeader>
                <DialogTitle>Add Recurring Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
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
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount
                  </Label>
                  <Input
                    id="amount"
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
                  <Label htmlFor="currency" className="text-sm font-medium">
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
                  <Label htmlFor="category" className="text-sm font-medium">
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
                  <Label htmlFor="frequency" className="text-sm font-medium">
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
                  <Label htmlFor="next_due_date" className="text-sm font-medium">
                    Next Due Date
                  </Label>
                  <Input
                    id="next_due_date"
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
                  <Label
                    htmlFor="reminder_days_before"
                    className="text-sm font-medium"
                  >
                    Remind (days before)
                  </Label>
                  <Input
                    id="reminder_days_before"
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

                <DialogFooter>
                  <Button type="submit" size="sm" disabled={isAdding}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {recurringTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No recurring transactions yet. Click "Add Transaction" to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {recurringTransactions.map((transaction) => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkAsDone={handleMarkAsDone}
                  isMarkingDone={isMarkingDone}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Form */}
      <EditRecurringTransactionForm
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSaveEdit}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default RecurringTransactions;
