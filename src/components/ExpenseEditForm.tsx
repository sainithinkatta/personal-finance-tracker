import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Expense, ExpenseCategory } from '@/types/expense';
import { BankAccount } from '@/types/bankAccount';
import { useBudgets } from '@/hooks/useBudgets';

interface ExpenseEditFormProps {
  expense: Expense;
  onUpdateExpense: (id: string, expense: Partial<Expense>) => void;
  onClose: () => void;
  bankAccounts: BankAccount[];
}

const ExpenseEditForm: React.FC<ExpenseEditFormProps> = ({ expense, onUpdateExpense, onClose, bankAccounts }) => {
  const { toast } = useToast();
  const { getActiveBudgetsForDate } = useBudgets();
  
  // Parse date as local date to prevent timezone issues
  const parseLocalDate = (dateInput: Date | string): Date => {
    if (typeof dateInput === 'string') {
      const [year, month, day] = dateInput.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return dateInput;
  };
  
  const [date, setDate] = useState<Date>(parseLocalDate(expense.date));
  const [amount, setAmount] = useState<string>(expense.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [description, setDescription] = useState<string>(expense.description || '');
  const [currency, setCurrency] = useState<string>(expense.currency || 'USD');
  const [bankAccountId, setBankAccountId] = useState<string>(expense.bank_account_id || '');
  const [budgetId, setBudgetId] = useState<string>(expense.budget_id || 'none');

  // Filter bank accounts by selected currency
  const filteredBankAccounts = bankAccounts.filter(
    (acct) => acct.currency === currency
  );

  // Clear bank selection when currency changes if current bank doesn't match
  useEffect(() => {
    if (bankAccountId) {
      const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);
      if (selectedBank && selectedBank.currency !== currency) {
        setBankAccountId('');
        toast({
          title: 'Bank Selection Reset',
          description: 'Bank selection cleared because currency changed.',
        });
      }
    }
  }, [currency, bankAccountId, bankAccounts, toast]);

  // Filter budgets by selected currency
  const activeBudgets = getActiveBudgetsForDate(date).filter(
    (b) => b.currency === currency
  );

  const getCurrencySymbol = (code: string) => {
    return code === 'INR' ? (
      <IndianRupee className="h-4 w-4" />
    ) : (
      <DollarSign className="h-4 w-4" />
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    // Validate currency-bank match if bank is selected
    if (bankAccountId) {
      const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);
      if (selectedBank && selectedBank.currency !== currency) {
        toast({
          title: 'Currency Mismatch',
          description: 'Selected bank currency does not match expense currency.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Bank account is required
    if (!bankAccountId) {
      toast({
        title: 'Bank Account Required',
        description: 'Please select a bank account.',
        variant: 'destructive',
      });
      return;
    }

    const updatedExpense: Partial<Expense> = {
      date,
      amount: Number(amount),
      category,
      description,
      currency,
      bank_account_id: bankAccountId,
      budget_id: budgetId === 'none' ? undefined : budgetId,
    };

    onUpdateExpense(expense.id, updatedExpense);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="edit-date"
                variant="outline"
                className="w-full justify-start text-left font-normal min-w-0"
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{format(date, 'PPP')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="edit-currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$ US Dollar</SelectItem>
              <SelectItem value="INR">₹ Indian Rupee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {getCurrencySymbol(currency)}
          </span>
          <Input
            id="edit-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-9"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-category">Category</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
          <SelectTrigger id="edit-category">
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

      <div className="space-y-2">
        <Label htmlFor="edit-bank-account">Bank Account *</Label>
        <Select
          value={bankAccountId}
          onValueChange={setBankAccountId}
          disabled={filteredBankAccounts.length === 0}
        >
          <SelectTrigger id="edit-bank-account">
            <SelectValue placeholder={filteredBankAccounts.length === 0 ? `No ${currency} accounts` : "Select bank account"} />
          </SelectTrigger>
          <SelectContent>
            {filteredBankAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.account_type || 'Debit'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filteredBankAccounts.length === 0 && (
          <p className="text-sm text-amber-600">
            No bank accounts available for {currency}. Add a {currency} account first.
          </p>
        )}
      </div>

      {activeBudgets.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="edit-budget">
            Budget <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Select value={budgetId} onValueChange={setBudgetId}>
            <SelectTrigger id="edit-budget">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No budget</SelectItem>
              {activeBudgets.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  {budget.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-description">
          Description <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this expense"
          className="resize-none min-h-[96px]"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="default" className="flex-1">
          Update Expense
        </Button>
      </div>
    </form>
  );
};

export default ExpenseEditForm;
