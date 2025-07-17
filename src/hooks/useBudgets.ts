
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Budget, CategoryAllocations } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';

export const useBudgets = (onBudgetCreated?: (budget: Budget) => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: budgets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Budget Created',
        description: 'Your budget has been created successfully.',
      });
      // Call the callback to auto-open allocation
      if (onBudgetCreated && data) {
        onBudgetCreated(data as Budget);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create budget. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Budget> }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Budget Updated',
        description: 'Your budget has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update budget. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateCategoryAllocationsMutation = useMutation({
    mutationFn: async ({ id, allocations }: { id: string; allocations: CategoryAllocations }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          travel_allocated: allocations.travel_allocated,
          groceries_allocated: allocations.groceries_allocated,
          food_allocated: allocations.food_allocated,
          bills_allocated: allocations.bills_allocated,
          others_allocated: allocations.others_allocated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useBudgets: Error updating allocations:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Allocations Saved',
        description: 'Category allocations have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save allocations. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Budget Deleted',
        description: 'Your budget has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete budget. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getActiveBudgetsForDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return budgets.filter(budget => {
      // Match month and year
      if (budget.month !== month || budget.year !== year) {
        return false;
      }
      
      // Check date range if specified
      if (budget.start_date && budget.end_date) {
        const budgetStart = new Date(budget.start_date);
        const budgetEnd = new Date(budget.end_date);
        return date >= budgetStart && date <= budgetEnd;
      }
      
      return true;
    });
  };

  return {
    budgets,
    isLoading,
    error,
    createBudget: createBudgetMutation.mutate,
    updateBudget: updateBudgetMutation.mutate,
    updateCategoryAllocations: updateCategoryAllocationsMutation.mutateAsync, // changed from mutate to mutateAsync
    deleteBudget: deleteBudgetMutation.mutate,
    getActiveBudgetsForDate,
    isCreating: createBudgetMutation.isPending,
    isUpdating: updateBudgetMutation.isPending,
    isDeleting: deleteBudgetMutation.isPending,
    isUpdatingAllocations: updateCategoryAllocationsMutation.isPending,
  };
};
