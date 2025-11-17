import React, { useState, useEffect } from 'react';
import { Plus, Bell, Calendar, Edit2, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
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
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { RecurringTransaction, RecurringTransactionFormData } from '@/types/recurringTransaction';
import { CURRENCIES, ExpenseCategory } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { RecurringTransactionCard } from '@/components/recurring/RecurringTransactionCard';
import { EditRecurringTransactionForm } from '@/components/recurring/EditRecurringTransactionForm';
import { parseLocalDate } from '@/utils/dateUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false);
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
        parseLocalDate(tx.next_due_date),
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
    setDeletingTransactionId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingTransactionId) {
      deleteRecurringTransaction(deletingTransactionId);
      setDeletingTransactionId(null);
    }
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
        return 'bg-info-muted text-info-foreground';
      case 'weekly':
        return 'bg-accent-muted text-accent-foreground';
      case 'monthly':
        return 'bg-warning-muted text-warning-foreground';
      case 'yearly':
        return 'bg-warning-muted text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Groceries':
        return 'bg-green-100 text-green-800';
      case 'Food':
        return 'bg-orange-100 text-orange-800';
      case 'Travel':
        return 'bg-blue-100 text-blue-800';
      case 'Bills':
        return 'bg-red-100 text-red-800';
      case 'Others':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const transactionToDelete = recurringTransactions.find(t => t.id === deletingTransactionId);

  return (
    <div className="space-y-6">
      {/* Collapsible Upcoming Reminders Notification */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-warning-muted to-warning-muted border border-warning/20 rounded-lg overflow-hidden">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
            aria-expanded={isUpcomingExpanded}
            aria-controls="upcoming-payments-content"
            className={cn(
              "w-full flex items-center justify-between p-4",
              "transition-colors duration-200",
              "hover:bg-warning-muted/50",
              "focus:outline-none focus:ring-2 focus:ring-warning focus:ring-inset",
              "touch-target"
            )}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-warning-foreground">Upcoming Payments</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Count Badge */}
              <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-warning text-warning-foreground text-xs font-semibold">
                {upcomingReminders.length}
              </span>
              {/* Chevron Icon */}
              {isUpcomingExpanded ? (
                <ChevronUp className="h-5 w-5 text-warning transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-warning transition-transform duration-200" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          <div
            id="upcoming-payments-content"
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isUpcomingExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="px-4 pb-4 grid gap-2">
              {upcomingReminders.map((tx) => {
                const daysUntilDue = differenceInDays(
                  parseLocalDate(tx.next_due_date),
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
                    className="flex flex-col bg-card rounded-md border border-warning/20 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Calendar className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{tx.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {format(parseLocalDate(tx.next_due_date), 'MMM d')} • {dueLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold text-foreground text-sm">
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

                    {tx.last_reminder_sent_at && (
                      <div className="flex items-center gap-1.5 text-xs text-accent bg-accent-muted px-2 py-1 rounded-md border border-accent/20">
                        <span className="text-sm">🕓</span>
                        <span>
                          Notified via Email at {format(new Date(tx.last_reminder_sent_at), 'h:mm a zzz')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Transactions List */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-2 pt-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="flex shadow-lg ml-auto">
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
            <p className="text-center text-muted-foreground py-8">
              No recurring transactions yet. Click "Add Transaction" to get started.
            </p>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block space-y-4">
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

              {/* Mobile Card View */}
              <div className="block md:hidden">
                <ScrollArea className="h-[60vh] max-h-[500px]">
                  <div className="space-y-3 pb-20">
                    {recurringTransactions.map((transaction) => {
                      const daysUntilDue = differenceInDays(
                        parseLocalDate(transaction.next_due_date),
                        new Date()
                      );

                      return (
                        <article
                          key={transaction.id}
                          className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          {/* Main Content */}
                          <div className="p-4">
                            <div className="flex gap-3">
                              {/* Date Section - Calendar Style */}
                              <div className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center bg-gradient-to-br from-info-muted to-info-muted/50 rounded-xl border border-info/20">
                                <div className="text-2xl font-bold text-foreground leading-none">
                                  {format(parseLocalDate(transaction.next_due_date), 'dd')}
                                </div>
                                <div className="text-xs font-semibold text-info-foreground uppercase mt-0.5">
                                  {format(parseLocalDate(transaction.next_due_date), 'MMM')}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {format(parseLocalDate(transaction.next_due_date), 'EEE')}
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="flex-1 min-w-0 flex flex-col gap-2">
                                {/* Category and Amount Row */}
                                <div className="flex items-start justify-between gap-2">
                                  <Badge
                                    className={cn(
                                      'font-semibold text-xs px-3 py-1 rounded-lg',
                                      getCategoryColor(transaction.category)
                                    )}
                                  >
                                    {transaction.category}
                                  </Badge>
                                  <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                  </div>
                                </div>

                                {/* Name */}
                                <div className="text-sm font-medium text-foreground leading-relaxed">
                                  {transaction.name}
                                </div>

                                {/* Frequency and Due Info */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    className={cn(
                                      'text-xs',
                                      getFrequencyBadgeColor(transaction.frequency)
                                    )}
                                  >
                                    {transaction.frequency}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                                  </span>
                                  {transaction.status === 'done' && (
                                    <Badge className="text-xs bg-green-100 text-green-800">
                                      ✓ Done
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="flex items-center border-t bg-muted/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-11 rounded-none hover:bg-primary/10 flex items-center justify-center gap-2 touch-target transition-colors border-r"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit2 className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-11 rounded-none hover:bg-green-600/10 flex items-center justify-center gap-2 touch-target transition-colors border-r"
                              onClick={() => handleMarkAsDone(transaction.id)}
                              disabled={isMarkingDone || transaction.status === 'done'}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Done</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-11 rounded-none hover:bg-destructive/10 flex items-center justify-center gap-2 touch-target transition-colors"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium text-destructive">Delete</span>
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Form - Bottom Sheet on Mobile, Dialog on Desktop */}
      {isMobile ? (
        <BottomSheet open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>Edit Recurring Transaction</BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              {editingTransaction && (
                <EditRecurringTransactionForm
                  transaction={editingTransaction}
                  isOpen={true}
                  onClose={() => setEditingTransaction(null)}
                  onSave={handleSaveEdit}
                  isLoading={isUpdating}
                />
              )}
            </BottomSheetBody>
          </BottomSheetContent>
        </BottomSheet>
      ) : (
        <EditRecurringTransactionForm
          transaction={editingTransaction}
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleSaveEdit}
          isLoading={isUpdating}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTransactionId} onOpenChange={() => setDeletingTransactionId(null)}>
        <AlertDialogContent className="mx-auto w-[calc(100%-2rem)] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring transaction{transactionToDelete ? ` "${transactionToDelete.name}" for ${formatCurrency(transactionToDelete.amount, transactionToDelete.currency)}` : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTransactionId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecurringTransactions;