import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Expense, ExpenseCategory, CURRENCIES } from '@/types/expense';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useBudgets } from '@/hooks/useBudgets';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  expense?: Expense;
  onClose?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, expense, onClose }) => {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
  const { getActiveBudgetsForDate } = useBudgets();
  const isEditing = !!expense;

  const [date, setDate] = useState<Date>(expense?.date || new Date());
  const [amount, setAmount] = useState<string>(expense?.amount?.toString() || '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'Groceries');
  const [description, setDescription] = useState<string>(expense?.description || '');
  const [currency, setCurrency] = useState<string>(expense?.currency || 'USD');
  const [bankAccountId, setBankAccountId] = useState<string>(expense?.bank_account_id || '');
  const [budgetId, setBudgetId] = useState<string>(expense?.budget_id || 'none');

  const activeBudgets = getActiveBudgetsForDate(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (!bankAccountId) {
      toast({
        title: 'Bank Account Required',
        description: 'Please select a bank account (USD only)',
        variant: 'destructive',
      });
      return;
    }

    const newExpense: Omit<Expense, 'id'> = {
      date,
      amount: Number(amount),
      category,
      description,
      currency,
      bank_account_id: bankAccountId,
      budget_id: budgetId === 'none' ? undefined : budgetId,
    };

    onAddExpense(newExpense);

    if (!isEditing) {
      // Reset form only when adding new expense
      setAmount('');
      setDescription('');
      setBankAccountId('');
      setBudgetId('none');
    }

    if (onClose) {
      onClose();
    }
  };

  // Filter bank accounts to only those with USD currency:
  const usdOnlyAccounts = bankAccounts.filter((acct) => acct.currency === 'USD');

  return (
    <form onSubmit={handleSubmit} className="space-y-3 px-4 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 rounded-xl border px-3 text-[15px]",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Currency</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-11 rounded-xl border px-3 text-[15px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="USD">
                  $ US Dollar
                </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[15px]">
            $
          </span>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-8 h-11 rounded-xl border px-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ExpenseCategory)}
        >
          <SelectTrigger className="h-11 rounded-xl border px-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Groceries">Groceries</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Bills">Bills</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Bank Account (USD only)
        </label>

        <Select value={bankAccountId} onValueChange={setBankAccountId} required>
          <SelectTrigger className="h-11 rounded-xl border px-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary">
            <SelectValue placeholder="Select bank account" />
          </SelectTrigger>
          <SelectContent>
            {usdOnlyAccounts.length > 0 ? (
              usdOnlyAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
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
          <label className="text-xs font-medium text-muted-foreground">
            Budget (Optional)
          </label>
          <Select value={budgetId} onValueChange={setBudgetId}>
            <SelectTrigger className="h-11 rounded-xl border px-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No budget</SelectItem>
              {activeBudgets.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  {budget.name} ({budget.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Description (Optional)
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this expense"
          className="resize-none min-h-[96px] rounded-xl border px-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 rounded-xl"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className={cn(
            "h-11 rounded-xl bg-primary text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary",
            !onClose && "col-span-2"
          )}
        >
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;