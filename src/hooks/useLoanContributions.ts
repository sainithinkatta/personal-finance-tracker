import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoanContribution, LoanContributionFormData } from '@/types/loan';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useLoanContributions = (loanId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contributions for a specific loan
  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['loan-contributions', loanId],
    queryFn: async () => {
      if (!loanId) return [];

      const { data, error } = await supabase
        .from('loan_contributions')
        .select('*')
        .eq('loan_id', loanId)
        .order('contribution_date', { ascending: false });

      if (error) throw error;
      return data as LoanContribution[];
    },
    enabled: !!loanId,
  });

  // Add contribution
  const addContributionMutation = useMutation({
    mutationFn: async (formData: LoanContributionFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('loan_contributions')
        .insert({
          loan_id: formData.loan_id,
          user_id: user.id,
          amount: formData.amount,
          contribution_date: format(formData.contribution_date, 'yyyy-MM-dd'),
          note: formData.note || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-contributions', loanId] });
      toast({
        title: 'Contribution Added',
        description: 'Your loan contribution has been recorded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add contribution. Please try again.',
        variant: 'destructive',
      });
      console.error('Add contribution error:', error);
    },
  });

  // Update contribution
  const updateContributionMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<LoanContributionFormData> }) => {
      const updates: Record<string, any> = {};
      
      if (formData.amount !== undefined) updates.amount = formData.amount;
      if (formData.contribution_date !== undefined) {
        updates.contribution_date = format(formData.contribution_date, 'yyyy-MM-dd');
      }
      if (formData.note !== undefined) updates.note = formData.note || null;

      const { data, error } = await supabase
        .from('loan_contributions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-contributions', loanId] });
      toast({
        title: 'Contribution Updated',
        description: 'Your loan contribution has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update contribution. Please try again.',
        variant: 'destructive',
      });
      console.error('Update contribution error:', error);
    },
  });

  // Delete contribution
  const deleteContributionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loan_contributions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-contributions', loanId] });
      toast({
        title: 'Contribution Deleted',
        description: 'Your loan contribution has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete contribution. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete contribution error:', error);
    },
  });

  // Calculate total contributions after the reference date
  const calculateTotalContributions = (referenceDate: string): number => {
    const refDate = new Date(referenceDate);
    return contributions
      .filter(c => new Date(c.contribution_date) > refDate)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  return {
    contributions,
    isLoading,
    addContribution: addContributionMutation.mutate,
    updateContribution: updateContributionMutation.mutate,
    deleteContribution: deleteContributionMutation.mutate,
    isAdding: addContributionMutation.isPending,
    isUpdating: updateContributionMutation.isPending,
    isDeleting: deleteContributionMutation.isPending,
    calculateTotalContributions,
  };
};
