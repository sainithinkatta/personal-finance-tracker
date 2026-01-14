/**
 * =====================================================
 * RECURRING PLANS HOOK
 * =====================================================
 * 
 * Manages recurring plan templates (create, update, cancel, pause/resume).
 * Plans are the "blueprints" that generate individual payment occurrences.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  RecurringPlan, 
  RecurringPlanWithComputed, 
  RecurringPlanFormData,
  PlanStatus 
} from '@/types/recurringPlan';
import { ExpenseCategory } from '@/types/expense';
import { parseLocalDate } from '@/utils/dateUtils';
import { differenceInDays, startOfDay } from 'date-fns';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function computePlanData(plan: RecurringPlan): RecurringPlanWithComputed {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseLocalDate(plan.next_due_date));
  const daysUntilDue = differenceInDays(dueDate, today);

  return {
    ...plan,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
  };
}

// =====================================================
// MAIN HOOK
// =====================================================

export function useRecurringPlans() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all plans for the current user
  const {
    data: plans = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recurring-plans'],
    queryFn: async (): Promise<RecurringPlanWithComputed[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((plan) => computePlanData({
        ...plan,
        name: plan.name || '',
        amount: plan.amount || 0,
        category: (plan.category || 'Others') as ExpenseCategory,
        frequency: (plan.frequency || 'monthly') as 'daily' | 'weekly' | 'monthly' | 'yearly',
        plan_status: (plan.plan_status || 'active') as PlanStatus,
        email_reminder: plan.email_reminder ?? true,
        reminder_days_before: plan.reminder_days_before ?? 2,
        status: plan.status || 'pending',
      }));
    },
  });

  // Create a new plan
  const createPlanMutation = useMutation({
    mutationFn: async (formData: RecurringPlanFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          name: formData.name,
          amount: formData.amount,
          category: formData.category,
          frequency: formData.frequency,
          next_due_date: formData.next_due_date,
          currency: formData.currency,
          bank_account_id: formData.bank_account_id,
          email_reminder: formData.email_reminder,
          reminder_days_before: formData.reminder_days_before,
          plan_status: 'active',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      toast({ title: 'Plan created', description: 'Recurring payment plan added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update an existing plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecurringPlanFormData> }) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      toast({ title: 'Plan updated', description: 'Changes saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Cancel a plan (set status to cancelled)
  const cancelPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          plan_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      toast({ title: 'Plan cancelled', description: 'No new payments will be scheduled.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Pause a plan
  const pausePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          plan_status: 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      toast({ title: 'Plan paused', description: 'Payments are temporarily on hold.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Resume a paused plan
  const resumePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          plan_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      toast({ title: 'Plan resumed', description: 'Payments will continue as scheduled.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete a plan permanently
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-occurrences'] });
      toast({ title: 'Plan deleted', description: 'Recurring plan removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Filtered getters
  const activePlans = plans.filter(p => p.plan_status === 'active');
  const pausedPlans = plans.filter(p => p.plan_status === 'paused');
  const cancelledPlans = plans.filter(p => p.plan_status === 'cancelled');

  return {
    plans,
    activePlans,
    pausedPlans,
    cancelledPlans,
    isLoading,
    error,
    createPlan: createPlanMutation.mutate,
    updatePlan: updatePlanMutation.mutate,
    cancelPlan: cancelPlanMutation.mutate,
    pausePlan: pausePlanMutation.mutate,
    resumePlan: resumePlanMutation.mutate,
    deletePlan: deletePlanMutation.mutate,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isCancelling: cancelPlanMutation.isPending,
    isPausing: pausePlanMutation.isPending,
    isResuming: resumePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
}
