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

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  expense?: Expense;
  onClose?: () => void;
  formId?: string;
  hideSubmit?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onAddExpense,
  expense,
  onClose,
  formId,
  hideSubmit = false,
}) => {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
  const { getActiveBudgetsForDate } = useBudgets();
  const isEditing = !!expense;

  const [date, setDate] = useState<Date>(expense?.date || new Date());
  const [amount, setAmount] = useState<string>(expense?.amount?.toString() || "");
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category || "Groceries"
  );
  const [description, setDescription] = useState<string>(expense?.description || "");
  const [currency, setCurrency] = useState<string>(expense?.currency || "USD");
  const [bankAccountId, setBankAccountId] = useState<string>(
    expense?.bank_account_id || ""
  );
  const [budgetId, setBudgetId] = useState<string>(expense?.budget_id || "none");

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

    if (!bankAccountId) {
      toast({
        title: "Bank Account Required",
        description: "Please select a bank account (USD only)",
        variant: "destructive",
      });
      return;
    }

    const newExpense: Omit<Expense, "id"> = {
      date,
      amount: Number(amount),
      category,
      description,
      currency,
      bank_account_id: bankAccountId,
      budget_id: budgetId === "none" ? undefined : budgetId,
    };

    onAddExpense(newExpense);

    if (!isEditing) {
      setAmount("");
      setDescription("");
      setBankAccountId("");
      setBudgetId("none");
    }

    if (onClose) {
      onClose();
    }
  };

  const usdOnlyAccounts = bankAccounts.filter((acct) => acct.currency === "USD");

  return (
    <form
      onSubmit={handleSubmit}
      id={formId}
      className="space-y-3"
      autoComplete="off"
    >
      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="expense-date"
        >
          Date
        </label>
        <Input
          id="expense-date"
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
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="expense-currency"
        >
          Currency
        </label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger
            id="expense-currency"
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
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="expense-amount"
        >
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {CURRENCIES.find((curr) => curr.code === currency)?.symbol || "$"}
          </span>
          <Input
            id="expense-amount"
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
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="expense-category"
        >
          Category
        </label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ExpenseCategory)}
        >
          <SelectTrigger
            id="expense-category"
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

      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="expense-bank-account"
        >
          Bank Account (USD only)
        </label>
        <Select value={bankAccountId} onValueChange={setBankAccountId} required>
          <SelectTrigger
            id="expense-bank-account"
            className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <SelectValue placeholder="Select bank account" />
          </SelectTrigger>
          <SelectContent className="text-[15px]">
            {usdOnlyAccounts.length > 0 ? (
              usdOnlyAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-[15px]">
                  {account.name} ({account.currency})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no_usd_accounts" disabled>
                No USD accounts available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {activeBudgets.length > 0 && (
        <div className="space-y-1.5">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="expense-budget"
          >
            Budget (Optional)
          </label>
          <Select value={budgetId} onValueChange={setBudgetId}>
            <SelectTrigger
              id="expense-budget"
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
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="expense-description"
        >
          Description (Optional)
        </label>
        <Textarea
          id="expense-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this expense"
          className="min-h-[96px] resize-none rounded-2xl border border-muted-foreground/30 px-3 py-2 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      {!hideSubmit && (
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isEditing ? "Update Expense" : "Add Expense"}
        </button>
      )}
    </form>
  );
};

export default ExpenseForm;
