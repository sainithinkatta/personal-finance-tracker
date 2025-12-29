import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transaction';
import { ExpenseCategory } from '@/types/expense';
import { BankAccount } from '@/types/bankAccount';
import { useToast } from '@/hooks/use-toast';

// Parse date string as local date to avoid timezone shifts
const parseLocalDate = (dateStr: string): Date => {
  const dateOnly = dateStr.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const useTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch both expenses and income, merge into unified transactions
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (expensesError) throw expensesError;

      // Fetch income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });
      
      if (incomeError) throw incomeError;

      // Map expenses to transactions
      const expenseTransactions: Transaction[] = (expensesData || []).map(e => ({
        id: `expense-${e.id}`,
        type: 'expense' as const,
        date: parseLocalDate(e.date),
        amount: e.amount || 0, // Positive for expenses
        category: (e.category || 'Others') as ExpenseCategory,
        description: e.description || undefined,
        currency: e.currency || 'USD',
        bank_account_id: e.bank_account_id || undefined,
        budget_id: e.budget_id || undefined,
        sourceId: e.id,
      }));

      // Map income to transactions (negative amount for credits)
      const incomeTransactions: Transaction[] = (incomeData || []).map(i => ({
        id: `income-${i.id}`,
        type: 'income' as const,
        date: parseLocalDate(i.date),
        amount: -(i.amount || 0), // Negative for income (credit)
        category: 'Income' as const,
        description: i.description || undefined,
        currency: i.currency || 'USD',
        bank_account_id: i.bank_account_id || undefined,
        budget_id: undefined,
        sourceId: i.id,
      }));

      // Merge and sort by date descending
      const allTransactions = [...expenseTransactions, ...incomeTransactions];
      allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

      return allTransactions;
    },
  });

  // Helper function to apply balance changes to bank accounts
  const applyBalanceChange = async (accountId: string, delta: number) => {
    const { data: acct, error: fetchErr } = await supabase
      .from('bank_accounts')
      .select('balance, available_balance, account_type, due_balance')
      .eq('id', accountId)
      .single();
    if (fetchErr || !acct) throw fetchErr ?? new Error('Account not found');

    const isCredit = acct.account_type?.toLowerCase() === 'credit';
    const now = new Date().toISOString();
    const updates: Partial<BankAccount> = { updated_at: now };

    if (isCredit) {
      const currAvail = acct.available_balance ?? acct.balance;
      updates.available_balance = currAvail + delta;
      updates.balance = acct.balance + delta;
      updates.due_balance = (acct.due_balance ?? 0) - delta;
    } else {
      updates.balance = acct.balance + delta;
    }

    const { error: updErr } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', accountId);
    if (updErr) throw updErr;
  };

  // Delete income mutation → restore bank balance (reverse the add)
  const deleteIncome = useMutation<void, unknown, string>({
    mutationFn: async (incomeId) => {
      // Fetch the income record
      const { data: income, error: fetchErr } = await supabase
        .from('income')
        .select('amount, bank_account_id')
        .eq('id', incomeId)
        .single();
      if (fetchErr || !income) throw fetchErr ?? new Error('Income not found');

      // Delete the income record
      const { error: delErr } = await supabase.from('income').delete().eq('id', incomeId);
      if (delErr) throw delErr;

      // Reverse the balance change (income added to bank, so subtract it)
      if (income.bank_account_id && income.amount) {
        await applyBalanceChange(income.bank_account_id, -income.amount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({ title: 'Income Deleted', description: 'Balance adjusted.' });
    },
    onError: () =>
      toast({ title: 'Error', description: 'Failed to delete income.', variant: 'destructive' }),
  });

  // Delete expense mutation (for unified handling)
  const deleteExpense = useMutation<void, unknown, string>({
    mutationFn: async (expenseId) => {
      const { data: exp, error: fetchErr } = await supabase
        .from('expenses')
        .select('amount, bank_account_id')
        .eq('id', expenseId)
        .single();
      if (fetchErr || !exp) throw fetchErr;

      const { error: delErr } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (delErr) throw delErr;

      if (exp.bank_account_id) {
        await applyBalanceChange(exp.bank_account_id, exp.amount || 0);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Expense Deleted', description: 'Balance restored.' });
    },
    onError: () =>
      toast({ title: 'Error', description: 'Failed to delete expense.', variant: 'destructive' }),
  });

  // Unified delete based on transaction type
  const deleteTransaction = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      deleteIncome.mutate(transaction.sourceId);
    } else {
      deleteExpense.mutate(transaction.sourceId);
    }
  };

  return {
    transactions,
    isLoading,
    error,
    deleteTransaction,
    deleteIncome: deleteIncome.mutate,
    deleteExpense: deleteExpense.mutate,
    isDeleting: deleteIncome.isPending || deleteExpense.isPending,
  };
};
