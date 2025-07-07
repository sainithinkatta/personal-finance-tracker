
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SavingsGoal, SavingsGoalFormData } from '@/types/savingsGoal';
import { useToast } from '@/hooks/use-toast';

export const useSavingsGoals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: savingsGoals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['savings-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavingsGoal[];
    },
  });

  const addSavingsGoalMutation = useMutation({
    mutationFn: async (goal: SavingsGoalFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          ...goal,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: 'Savings Goal Added',
        description: 'Your savings goal has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add savings goal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateSavingsGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SavingsGoalFormData> }) => {
      const { error } = await supabase
        .from('savings_goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: 'Savings Goal Updated',
        description: 'Your savings goal has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update savings goal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteSavingsGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: 'Savings Goal Deleted',
        description: 'Your savings goal has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete savings goal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addContributionMutation = useMutation({
    mutationFn: async ({ goalId, amount, description }: { goalId: string; amount: number; description?: string }) => {
      // First, add the contribution record
      const { error: contributionError } = await supabase
        .from('savings_contributions')
        .insert([{
          savings_goal_id: goalId,
          amount,
          description,
          contribution_date: new Date().toISOString().split('T')[0],
        }]);

      if (contributionError) throw contributionError;

      // Then update the savings goal's current amount
      const { data: goal, error: fetchError } = await supabase
        .from('savings_goals')
        .select('current_amount')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const newAmount = (goal.current_amount || 0) + amount;
      const { error: updateError } = await supabase
        .from('savings_goals')
        .update({
          current_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: 'Contribution Added',
        description: 'Your contribution has been recorded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add contribution. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    savingsGoals,
    isLoading,
    error,
    addSavingsGoal: addSavingsGoalMutation.mutate,
    updateSavingsGoal: updateSavingsGoalMutation.mutate,
    deleteSavingsGoal: deleteSavingsGoalMutation.mutate,
    addContribution: addContributionMutation.mutate,
    isAdding: addSavingsGoalMutation.isPending,
    isUpdating: updateSavingsGoalMutation.isPending,
    isDeleting: deleteSavingsGoalMutation.isPending,
    isAddingContribution: addContributionMutation.isPending,
  };
};
