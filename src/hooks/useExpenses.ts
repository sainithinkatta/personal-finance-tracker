
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

export const useExpenses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: expenses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      return data.map(expense => ({
        ...expense,
        date: new Date(expense.date),
      })) as Expense[];
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expense,
          user_id: user.id,
          date: expense.date.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Update bank account balance if specified
      if (expense.bank_account_id) {
        // First get the current balance
        const { data: account, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', expense.bank_account_id)
          .single();

        if (fetchError) {
          console.warn('Failed to fetch bank account:', fetchError);
        } else {
          // Update the balance
          const newBalance = account.balance - expense.amount;
          const { error: updateError } = await supabase
            .from('bank_accounts')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', expense.bank_account_id);

          if (updateError) {
            console.warn('Failed to update bank balance:', updateError);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      // Invalidate budgets cache to refresh budget spending totals
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Expense Added',
        description: 'Your expense has been recorded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Expense> }) => {
      // First, get the current expense to compare old vs new values
      const { data: currentExpense, error: fetchError } = await supabase
        .from('expenses')
        .select('amount, bank_account_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update the expense
      const { error: updateError } = await supabase
        .from('expenses')
        .update({
          ...data,
          date: data.date ? data.date.toISOString() : undefined,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Handle bank account balance updates if amount or bank account changed
      const oldAmount = currentExpense.amount;
      const newAmount = data.amount ?? oldAmount;
      const oldBankAccountId = currentExpense.bank_account_id;
      const newBankAccountId = data.bank_account_id;

      // If amount changed and there's a bank account involved
      if (oldAmount !== newAmount || oldBankAccountId !== newBankAccountId) {
        // If the old expense had a bank account, revert the old amount
        if (oldBankAccountId) {
          const { data: oldAccount, error: oldFetchError } = await supabase
            .from('bank_accounts')
            .select('balance')
            .eq('id', oldBankAccountId)
            .single();

          if (oldFetchError) {
            console.warn('Failed to fetch old bank account:', oldFetchError);
          } else {
            // Add back the old expense amount (reverse the deduction)
            const restoredBalance = oldAccount.balance + oldAmount;
            const { error: oldUpdateError } = await supabase
              .from('bank_accounts')
              .update({
                balance: restoredBalance,
                updated_at: new Date().toISOString()
              })
              .eq('id', oldBankAccountId);

            if (oldUpdateError) {
              console.warn('Failed to restore old bank balance:', oldUpdateError);
            }
          }
        }

        // If the new expense has a bank account, apply the new amount
        if (newBankAccountId && newBankAccountId !== 'none') {
          const { data: newAccount, error: newFetchError } = await supabase
            .from('bank_accounts')
            .select('balance')
            .eq('id', newBankAccountId)
            .single();

          if (newFetchError) {
            console.warn('Failed to fetch new bank account:', newFetchError);
          } else {
            // Deduct the new expense amount
            const newBalance = newAccount.balance - newAmount;
            const { error: newUpdateError } = await supabase
              .from('bank_accounts')
              .update({
                balance: newBalance,
                updated_at: new Date().toISOString()
              })
              .eq('id', newBankAccountId);

            if (newUpdateError) {
              console.warn('Failed to update new bank balance:', newUpdateError);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      // Invalidate budgets cache to refresh budget spending totals
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Expense Updated',
        description: 'Your expense has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      // Invalidate budgets cache to refresh budget spending totals
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Expense Deleted',
        description: 'The expense has been removed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    expenses,
    isLoading,
    error,
    addExpense: addExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    isAdding: addExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
  };
};
