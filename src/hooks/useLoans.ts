import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan, LoanFormData } from '@/types/loan';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useLoans = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all loans for the current user
  const { data: loans = [], isLoading, error } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Loan[];
    },
  });

  // Add loan mutation
  const addLoanMutation = useMutation({
    mutationFn: async (formData: LoanFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('loans')
        .insert({
          user_id: user.id,
          name: formData.name,
          principal: formData.principal,
          roi: formData.roi,
          reference_outstanding: formData.reference_outstanding,
          reference_date: format(formData.reference_date, 'yyyy-MM-dd'),
          currency: formData.currency,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Loan Added',
        description: 'Your loan has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add loan. Please try again.',
        variant: 'destructive',
      });
      console.error('Add loan error:', error);
    },
  });

  // Update loan mutation
  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<LoanFormData> }) => {
      const updates: Record<string, any> = {};
      
      if (formData.name !== undefined) updates.name = formData.name;
      if (formData.principal !== undefined) updates.principal = formData.principal;
      if (formData.roi !== undefined) updates.roi = formData.roi;
      if (formData.reference_outstanding !== undefined) updates.reference_outstanding = formData.reference_outstanding;
      if (formData.reference_date !== undefined) updates.reference_date = format(formData.reference_date, 'yyyy-MM-dd');
      if (formData.currency !== undefined) updates.currency = formData.currency;
      if (formData.notes !== undefined) updates.notes = formData.notes || null;

      const { data, error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Loan Updated',
        description: 'Your loan has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update loan. Please try again.',
        variant: 'destructive',
      });
      console.error('Update loan error:', error);
    },
  });

  // Delete loan mutation
  const deleteLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Loan Deleted',
        description: 'Your loan has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete loan. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete loan error:', error);
    },
  });

  return {
    loans,
    isLoading,
    error,
    addLoan: addLoanMutation.mutate,
    updateLoan: updateLoanMutation.mutate,
    deleteLoan: deleteLoanMutation.mutate,
    isAdding: addLoanMutation.isPending,
    isUpdating: updateLoanMutation.isPending,
    isDeleting: deleteLoanMutation.isPending,
  };
};
