
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BankAccount, BankAccountFormData } from '@/types/bankAccount';
import { useToast } from '@/hooks/use-toast';

export const useBankAccounts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: bankAccounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch bank accounts:', error);
        throw error;
      }
      
      return data as BankAccount[];
    },
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (accountData: BankAccountFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For credit accounts, set balance to credit_limit, for debit use balance
      const processedData = {
        ...accountData,
        balance: accountData.account_type === 'Credit' ? (accountData.credit_limit || 0) : accountData.balance,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([processedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({
        title: 'Bank Account Added',
        description: 'Your bank account has been added successfully.',
      });
    },
    onError: (error) => {
      console.error('Add bank account error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bank account. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BankAccountFormData> }) => {
      // For credit accounts, set balance to credit_limit, for debit use balance
      const processedData = {
        ...data,
        balance: data.account_type === 'Credit' ? (data.credit_limit || 0) : data.balance,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('bank_accounts')
        .update(processedData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({
        title: 'Bank Account Updated',
        description: 'Your bank account has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update bank account error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bank account. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteBankAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({
        title: 'Bank Account Deleted',
        description: 'The bank account has been removed.',
      });
    },
    onError: (error) => {
      console.error('Delete bank account error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bank account. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    bankAccounts,
    isLoading,
    error,
    addBankAccount: addBankAccountMutation.mutate,
    updateBankAccount: updateBankAccountMutation.mutate,
    deleteBankAccount: deleteBankAccountMutation.mutate,
    isAdding: addBankAccountMutation.isPending,
    isUpdating: updateBankAccountMutation.isPending,
  };
};
