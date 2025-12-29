import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IncomeFormData } from '@/types/income';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useIncome = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper to apply balance change to bank account
  const applyBalanceChange = async (accountId: string, delta: number) => {
    const { data: acct, error: fetchErr } = await supabase
      .from('bank_accounts')
      .select('balance, available_balance, account_type, due_balance')
      .eq('id', accountId)
      .single();
    if (fetchErr || !acct) throw fetchErr ?? new Error('Account not found');

    const isCredit = acct.account_type?.toLowerCase() === 'credit';
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updated_at: now };

    if (isCredit) {
      const currAvail = acct.available_balance ?? acct.balance;
      updates.available_balance = currAvail + delta;
      updates.balance = acct.balance + delta;
      const newDueBalance = (acct.due_balance ?? 0) - delta;
      updates.due_balance = Math.max(0, newDueBalance);
    } else {
      updates.balance = acct.balance + delta;
    }

    const { error: updErr } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', accountId);
    if (updErr) throw updErr;
  };

  const addIncome = useMutation({
    mutationFn: async (incomeData: IncomeFormData) => {
      // Validate required fields
      if (!incomeData.bank_account_id) {
        throw new Error('Bank account is required');
      }
      if (!incomeData.amount || incomeData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!incomeData.currency) {
        throw new Error('Currency is required');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Verify bank account exists and currency matches
      const { data: bankAccount, error: bankError } = await supabase
        .from('bank_accounts')
        .select('id, currency, balance, available_balance, account_type, due_balance')
        .eq('id', incomeData.bank_account_id)
        .single();

      if (bankError || !bankAccount) {
        throw new Error('Bank account not found');
      }

      if (bankAccount.currency !== incomeData.currency) {
        throw new Error('Selected bank currency does not match the chosen currency');
      }

      // Round amount to 2 decimal places
      const roundedAmount = Math.round(incomeData.amount * 100) / 100;

      // Format date for database
      const dateStr = format(incomeData.date, 'yyyy-MM-dd');

      // Insert income record
      const { error: incomeError } = await supabase
        .from('income')
        .insert({
          user_id: user.id,
          bank_account_id: incomeData.bank_account_id,
          amount: roundedAmount,
          currency: incomeData.currency,
          description: incomeData.description || null,
          date: dateStr,
        });

      if (incomeError) {
        throw new Error('Failed to create income record');
      }

      // Update bank account balance (add income)
      await applyBalanceChange(incomeData.bank_account_id, roundedAmount);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Income Added',
        description: 'Bank balance updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add income.',
        variant: 'destructive',
      });
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IncomeFormData }) => {
      // Get the old income record
      const { data: oldIncome, error: fetchErr } = await supabase
        .from('income')
        .select('amount, bank_account_id')
        .eq('id', id)
        .single();
      if (fetchErr || !oldIncome) throw new Error('Income record not found');

      // Round new amount
      const roundedAmount = Math.round(data.amount * 100) / 100;

      // Format date for database
      const dateStr = format(data.date, 'yyyy-MM-dd');

      // Update income record
      const { error: updateErr } = await supabase
        .from('income')
        .update({
          bank_account_id: data.bank_account_id,
          amount: roundedAmount,
          currency: data.currency,
          description: data.description || null,
          date: dateStr,
        })
        .eq('id', id);

      if (updateErr) throw new Error('Failed to update income record');

      // Reverse old balance change (subtract old income)
      if (oldIncome.bank_account_id) {
        await applyBalanceChange(oldIncome.bank_account_id, -(oldIncome.amount || 0));
      }

      // Apply new balance change (add new income)
      await applyBalanceChange(data.bank_account_id, roundedAmount);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Income Updated',
        description: 'Changes saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update income.',
        variant: 'destructive',
      });
    },
  });

  return {
    addIncome: addIncome.mutateAsync,
    isAdding: addIncome.isPending,
    updateIncome: updateIncome.mutateAsync,
    isUpdating: updateIncome.isPending,
  };
};
