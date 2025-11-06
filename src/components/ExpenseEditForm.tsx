import React, { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Expense, ExpenseCategory, CURRENCIES } from "@/types/expense";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useBudgets } from "@/hooks/useBudgets";

interface ExpenseEditFormProps {
  expense: Expense;
  onUpdateExpense: (id: string, expense: Partial<Expense>) => void;
  onClose: () => void;
  formId?: string;
  hideActions?: boolean;
}

const ExpenseEditForm: React.FC<ExpenseEditFormProps> = ({
  expense,
  onUpdateExpense,
  onClose,
  formId,
  hideActions = false,
}) => {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
  const { getActiveBudgetsForDate } = useBudgets();

  const [date, setDate] = useState<Date>(new Date(expense.date));
  const [amount, setAmount] = useState<string>(expense.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [description, setDescription] = useState<string>(expense.description || "");
  const [currency, setCurrency] = useState<string>(expense.currency);
  const [bankAccountId, setBankAccountId] = useState<string>(
    expense.bank_account_id || "none"
  );
  const [budgetId, setBudgetId] = useState<string>(expense.budget_id || "none");

  const activeBudgets = getActiveBudgetsForDate(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const updatedExpense: Partial<Expense> = {
      date,
      amount: Number(amount),
      category,
      description,
      currency,
      bank_account_id: bankAccountId === "none" ? undefined : bankAccountId,
      budget_id: budgetId === "none" ? undefined : budgetId,
    };

    onUpdateExpense(expense.id, updatedExpense);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      id={formId}
      className="space-y-3"
      autoComplete="off"
    >
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-date">
          Date
        </label>
        <Input
          id="edit-expense-date"
          type="date"
          value={format(date, "yyyy-MM-dd")}
          onChange={(event) => {
            const value = event.target.value;
            if (value) {
              setDate(new Date(`${value}T00:00:00`));
            }
          }}
          className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-currency">
          Currency
        </label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger
            id="edit-expense-currency"
            className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.code} value={curr.code} className="text-[15px]">
                {curr.symbol} {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-amount">
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {CURRENCIES.find((curr) => curr.code === currency)?.symbol || "$"}
          </span>
          <Input
            id="edit-expense-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-11 rounded-xl border border-muted-foreground/30 pl-8 pr-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-category">
          Category
        </label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ExpenseCategory)}
        >
          <SelectTrigger
            id="edit-expense-category"
            className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <SelectValue placeholder="Select a category" />
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

      {bankAccounts.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-account">
            Bank Account (Optional)
          </label>
          <Select value={bankAccountId} onValueChange={setBankAccountId}>
            <SelectTrigger
              id="edit-expense-account"
              className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <SelectValue placeholder="Select bank account" />
            </SelectTrigger>
            <SelectContent className="text-[15px]">
              <SelectItem value="none">No bank account</SelectItem>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-[15px]">
                  {account.name} ({account.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeBudgets.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-budget">
            Budget (Optional)
          </label>
          <Select value={budgetId} onValueChange={setBudgetId}>
            <SelectTrigger
              id="edit-expense-budget"
              className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent className="text-[15px]">
              <SelectItem value="none">No budget</SelectItem>
              {activeBudgets.map((budget) => (
                <SelectItem key={budget.id} value={budget.id} className="text-[15px]">
                  {budget.name} ({budget.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-expense-description">
          Description (Optional)
        </label>
        <Textarea
          id="edit-expense-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this expense"
          className="min-h-[96px] resize-none rounded-2xl border border-muted-foreground/30 px-3 py-2 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      {!hideActions && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Update Expense
          </button>
        </div>
      )}
    </form>
  );
};

export default ExpenseEditForm;
