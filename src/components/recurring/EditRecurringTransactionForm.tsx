import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveSheet } from "@/components/layout/ResponsiveSheet";
import { RecurringTransaction, RecurringTransactionFormData } from "@/types/recurringTransaction";
import { CURRENCIES, ExpenseCategory } from "@/types/expense";

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
      });
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(transaction.id, formData);
    onClose();
  };

  const formId = "edit-recurring-transaction";

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title="Edit recurring transaction"
      description="Adjust the schedule or amount for this recurring expense."
      footer={(
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isLoading}
            className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
      contentClassName="pb-24"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-name">
            Name
          </label>
          <Input
            id="edit-recurring-name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="e.g., Netflix"
            className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-amount">
            Amount
          </label>
          <Input
            id="edit-recurring-amount"
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
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-currency">
            Currency
          </label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger
              id="edit-recurring-currency"
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-category">
            Category
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value as ExpenseCategory })
            }
          >
            <SelectTrigger
              id="edit-recurring-category"
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
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-frequency">
            Frequency
          </label>
          <Select
            value={formData.frequency}
            onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") =>
              setFormData({ ...formData, frequency: value })
            }
          >
            <SelectTrigger
              id="edit-recurring-frequency"
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-next-due">
            Next due date
          </label>
          <Input
            id="edit-recurring-next-due"
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
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-recurring-reminder">
            Reminder (days before)
          </label>
          <Input
            id="edit-recurring-reminder"
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
      </form>
    </ResponsiveSheet>
  );
};
