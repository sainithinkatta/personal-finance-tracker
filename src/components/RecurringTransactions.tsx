import React, { useEffect, useMemo, useState } from "react";
import { Plus, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveSheet } from "@/components/layout/ResponsiveSheet";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { RecurringTransaction, RecurringTransactionFormData } from "@/types/recurringTransaction";
import { CURRENCIES, ExpenseCategory } from "@/types/expense";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { RecurringTransactionCard } from "@/components/recurring/RecurringTransactionCard";
import { EditRecurringTransactionForm } from "@/components/recurring/EditRecurringTransactionForm";

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
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState<RecurringTransactionFormData>({
    name: "",
    amount: 0,
    category: "Bills" as ExpenseCategory,
    frequency: "monthly",
    next_due_date: "",
    currency: "USD",
    email_reminder: true,
    reminder_days_before: 2,
  });

  useEffect(() => {
    processRecurringTransactions();
  }, [processRecurringTransactions]);

  useEffect(() => {
    const upcomingReminders = getUpcomingReminders().filter((tx) => tx.status !== "done");
    upcomingReminders.forEach((tx) => {
      const daysUntilDue = differenceInDays(new Date(tx.next_due_date), new Date());
      if (daysUntilDue <= tx.reminder_days_before && daysUntilDue >= 0) {
        toast({
          title: "Upcoming reminder",
          description: `${tx.name} — ${formatCurrency(tx.amount, tx.currency)} due in ${daysUntilDue} day${
            daysUntilDue !== 1 ? "s" : ""
          }`,
        });
      }
    });
  }, [getUpcomingReminders, toast]);

  const resetForm = () => {
    setFormData({
      name: "",
      amount: 0,
      category: "Bills" as ExpenseCategory,
      frequency: "monthly",
      next_due_date: "",
      currency: "USD",
      email_reminder: true,
      reminder_days_before: 2,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addRecurringTransaction(formData);
    resetForm();
    setIsAddSheetOpen(false);
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

  const upcomingReminders = useMemo(
    () => getUpcomingReminders().filter((tx) => tx.status !== "done"),
    [getUpcomingReminders]
  );

  const addFormId = "add-recurring-transaction";

  return (
    <div className="space-y-4">
      {upcomingReminders.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-amber-700">
            <Bell className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Upcoming payments</h3>
          </div>
          <div className="space-y-3">
            {upcomingReminders.map((tx) => {
              const daysUntilDue = differenceInDays(new Date(tx.next_due_date), new Date());
              const dueLabel =
                daysUntilDue === 0
                  ? "Today"
                  : daysUntilDue === 1
                  ? "Tomorrow"
                  : `${daysUntilDue} days`;

              return (
                <article
                  key={tx.id}
                  className="rounded-2xl border border-amber-200 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-amber-100 p-2">
                        <Calendar className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(tx.next_due_date), "MMM d")} • {dueLabel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <Badge className="mt-1 rounded-full bg-amber-100 text-[11px] font-medium text-amber-700">
                        {tx.frequency}
                      </Badge>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recurring transactions</h2>
        <Button
          type="button"
          className="h-11 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90"
          onClick={() => setIsAddSheetOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      {recurringTransactions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-muted-foreground/40 bg-muted/40 py-12 text-center">
          <p className="text-base font-medium text-foreground">No recurring transactions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first recurring expense to stay ahead of upcoming bills.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
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

      <ResponsiveSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        title="Add recurring transaction"
        description="Keep subscriptions and bills organized."
        footer={(
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsAddSheetOpen(false)}
              className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={addFormId}
              disabled={isAdding}
              className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAdding ? "Saving..." : "Add"}
            </button>
          </div>
        )}
        contentClassName="pb-24"
      >
        <form id={addFormId} onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-name">
              Name
            </label>
            <Input
              id="recurring-name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="e.g., Netflix"
              className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-amount">
                Amount
              </label>
              <Input
                id="recurring-amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(event.target.value) || 0,
                  })
                }
                placeholder="0.00"
                className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-currency">
                Currency
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger
                  id="recurring-currency"
                  className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className="text-[15px]">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-[15px]">
                      {currency.symbol} {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-category">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as ExpenseCategory })
                }
              >
                <SelectTrigger
                  id="recurring-category"
                  className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="text-[15px]">
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-frequency">
                Frequency
              </label>
              <Select
                value={formData.frequency}
                onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger
                  id="recurring-frequency"
                  className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent className="text-[15px]">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-next-due">
                Next due date
              </label>
              <Input
                id="recurring-next-due"
                type="date"
                value={formData.next_due_date}
                onChange={(event) =>
                  setFormData({ ...formData, next_due_date: event.target.value })
                }
                className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="recurring-reminder">
                Reminder (days before)
              </label>
              <Input
                id="recurring-reminder"
                type="number"
                min="0"
                max="30"
                value={formData.reminder_days_before}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    reminder_days_before: parseInt(event.target.value, 10) || 0,
                  })
                }
                className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </form>
      </ResponsiveSheet>

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
