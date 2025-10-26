import React, { useState, useEffect } from 'react';
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

interface ExpenseEditFormProps {
  expense: Expense;
  onUpdateExpense: (id: string, expense: Partial<Expense>) => void;
  onClose: () => void;
}

const ExpenseEditForm: React.FC<ExpenseEditFormProps> = ({ expense, onUpdateExpense, onClose }) => {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
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
  const [currency, setCurrency] = useState<string>(expense.currency);
  const [bankAccountId, setBankAccountId] = useState<string>(expense.bank_account_id || 'none');
  const [budgetId, setBudgetId] = useState<string>(expense.budget_id || 'none');

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);
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

    const updatedExpense: Partial<Expense> = {
      date,
      amount: Number(amount),
      category,
      description,
      currency,
      bank_account_id: bankAccountId === 'none' ? undefined : bankAccountId,
      budget_id: budgetId === 'none' ? undefined : budgetId,
    };

    onUpdateExpense(expense.id, updatedExpense);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
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
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Currency</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">
            {selectedCurrency?.symbol || '$'}
          </span>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10">
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

      {bankAccounts.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bank Account (Optional)</label>
          <Select value={bankAccountId} onValueChange={setBankAccountId}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10">
              <SelectValue placeholder="Select bank account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No bank account</SelectItem>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeBudgets.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Budget (Optional)</label>
          <Select value={budgetId} onValueChange={setBudgetId}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10">
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this expense"
          className="resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
          Update Expense
        </Button>
      </div>
    </form>
  );
};

export default ExpenseEditForm;