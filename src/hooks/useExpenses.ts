import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { BankAccount } from '@/types/bankAccount';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useExpenses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse date string as local date to avoid timezone shifts
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Fetch expenses
  const { data: expenses = [], isLoading, error } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(e => ({ ...e, date: parseLocalDate(e.date) })) as Expense[];
    },
  });

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

  // Add expense → subtract from bank
  const addExpense = useMutation<Expense, unknown, Omit<Expense, 'id'>>({
    mutationFn: async expense => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newExpense, error: expErr } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id, date: format(expense.date, 'yyyy-MM-dd') }])
        .select()
        .single();
      if (expErr || !newExpense) throw expErr;

      if (expense.bank_account_id) {
        await applyBalanceChange(expense.bank_account_id, -expense.amount);
      }
      return { ...newExpense, date: parseLocalDate(newExpense.date) } as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Expense Added', description: 'Recorded successfully.' });
    },
    onError: () =>
      toast({ title: 'Error', description: 'Failed to add expense.', variant: 'destructive' }),
  });

  // Update expense → revert old debit then apply new one
  const updateExpense = useMutation<void, unknown, { id: string; data: Partial<Expense> }>({
    mutationFn: async ({ id, data }) => {
      const { data: oldExp, error: oldErr } = await supabase
        .from('expenses')
        .select('amount, bank_account_id')
        .eq('id', id)
        .single();
      if (oldErr || !oldExp) throw oldErr;

      // Patch the expense record
      const payload: any = {};
      if (data.amount != null) payload.amount = data.amount;
      if (data.date) payload.date = format(data.date, 'yyyy-MM-dd');
      if (data.category) payload.category = data.category;
      if (data.description !== undefined) payload.description = data.description;
      if (data.currency) payload.currency = data.currency;
      if (data.bank_account_id !== undefined) payload.bank_account_id = data.bank_account_id;
      if (data.budget_id !== undefined) payload.budget_id = data.budget_id;

      const { error: updErr } = await supabase.from('expenses').update(payload).eq('id', id);
      if (updErr) throw updErr;

      // Restore the old amount
      if (oldExp.bank_account_id) {
        await applyBalanceChange(oldExp.bank_account_id, oldExp.amount);
      }
      // Subtract the new amount
      const newAmt = data.amount ?? oldExp.amount;
      if (data.bank_account_id) {
        await applyBalanceChange(data.bank_account_id, -newAmt);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Expense Updated', description: 'Updated successfully.' });
    },
    onError: () =>
      toast({ title: 'Error', description: 'Failed to update expense.', variant: 'destructive' }),
  });

  // Delete expense → restore balance
  const deleteExpense = useMutation<void, unknown, string>({
    mutationFn: async id => {
      const { data: exp, error: fetchErr } = await supabase
        .from('expenses')
        .select('amount, bank_account_id')
        .eq('id', id)
        .single();
      if (fetchErr || !exp) throw fetchErr;

      const { error: delErr } = await supabase.from('expenses').delete().eq('id', id);
      if (delErr) throw delErr;

      if (exp.bank_account_id) {
        await applyBalanceChange(exp.bank_account_id, exp.amount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Expense Deleted', description: 'Balance restored.' });
    },
    onError: () =>
      toast({ title: 'Error', description: 'Failed to delete expense.', variant: 'destructive' }),
  });

  return {
    expenses,
    isLoading,
    error,
    addExpense: addExpense.mutate,
    updateExpense: updateExpense.mutate,
    deleteExpense: deleteExpense.mutate,
    isAdding: addExpense.isPending,
    isUpdating: updateExpense.isPending,
    isDeleting: deleteExpense.isPending,
  };
};