import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IncomeFormData } from '@/types/income';
import { useToast } from '@/hooks/use-toast';

export const useIncome = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      // Insert income record
      const { error: incomeError } = await supabase
        .from('income')
        .insert({
          user_id: user.id,
          bank_account_id: incomeData.bank_account_id,
          amount: roundedAmount,
          currency: incomeData.currency,
          description: incomeData.description || null,
        });

      if (incomeError) {
        throw new Error('Failed to create income record');
      }

      // Update bank account balance
      const isCredit = bankAccount.account_type?.toLowerCase() === 'credit';
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (isCredit) {
        // For credit accounts: increase available_balance, decrease due_balance
        const currAvail = bankAccount.available_balance ?? bankAccount.balance;
        updates.available_balance = currAvail + roundedAmount;
        updates.balance = bankAccount.balance + roundedAmount;
        const newDueBalance = (bankAccount.due_balance ?? 0) - roundedAmount;
        updates.due_balance = Math.max(0, newDueBalance); // Don't go negative
      } else {
        // For debit accounts: increase balance
        updates.balance = bankAccount.balance + roundedAmount;
      }

      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', incomeData.bank_account_id);

      if (updateError) {
        throw new Error('Failed to update bank balance');
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate bank-accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] }); // Refresh dashboard data
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

  return {
    addIncome: addIncome.mutateAsync,
    isAdding: addIncome.isPending,
  };
};
