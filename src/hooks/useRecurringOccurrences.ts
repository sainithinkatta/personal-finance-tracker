/**
 * =====================================================
 * RECURRING OCCURRENCES HOOK
 * =====================================================
 * 
 * Manages individual payment instances (mark as paid, skip, fetch history).
 * Each occurrence is linked to a parent plan.
 * 
 * Key operations:
 * - markAsPaid: Creates 'paid' occurrence, advances plan's next_due_date
 * - skipOccurrence: Creates 'skipped' occurrence, advances next_due_date
 * - fetchCompletedHistory: Gets all paid/skipped occurrences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  RecurringOccurrence, 
  RecurringOccurrenceWithPlan,
  RecurringPlan 
} from '@/types/recurringPlan';
import { ExpenseCategory } from '@/types/expense';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate the next due date based on frequency
 */
function calculateNextDueDate(
  currentDueDate: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
): string {
  const date = parseLocalDate(currentDueDate);
  
  let nextDate: Date;
  switch (frequency) {
    case 'daily':
      nextDate = addDays(date, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(date, 1);
      break;
    case 'monthly':
      nextDate = addMonths(date, 1);
      break;
    case 'yearly':
      nextDate = addYears(date, 1);
      break;
    default:
      nextDate = addMonths(date, 1);
  }
  
  return format(nextDate, 'yyyy-MM-dd');
}

// =====================================================
// MAIN HOOK
// =====================================================

export function useRecurringOccurrences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch completed occurrences (paid + skipped)
  const {
    data: completedOccurrences = [],
    isLoading: isLoadingCompleted,
    error: completedError,
  } = useQuery({
    queryKey: ['recurring-occurrences', 'completed'],
    queryFn: async (): Promise<RecurringOccurrenceWithPlan[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch occurrences
      const { data: occurrences, error: occError } = await supabase
        .from('recurring_occurrences')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['paid', 'skipped'])
        .order('occurrence_date', { ascending: false });

      if (occError) throw occError;

      if (!occurrences || occurrences.length === 0) return [];

      // Fetch associated plans
      const planIds = [...new Set(occurrences.map(o => o.plan_id))];
      const { data: plans, error: planError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .in('id', planIds);

      if (planError) throw planError;

      const plansMap = new Map(plans?.map(p => [p.id, p]) || []);

      return occurrences.map(occ => ({
        ...occ,
        status: occ.status as 'upcoming' | 'paid' | 'skipped',
        plan: plansMap.get(occ.plan_id) ? {
          ...plansMap.get(occ.plan_id)!,
          name: plansMap.get(occ.plan_id)!.name || '',
          amount: plansMap.get(occ.plan_id)!.amount || 0,
          category: (plansMap.get(occ.plan_id)!.category || 'Others') as ExpenseCategory,
          frequency: (plansMap.get(occ.plan_id)!.frequency || 'monthly') as 'daily' | 'weekly' | 'monthly' | 'yearly',
          plan_status: (plansMap.get(occ.plan_id)!.plan_status || 'active') as 'active' | 'paused' | 'cancelled',
          email_reminder: plansMap.get(occ.plan_id)!.email_reminder ?? true,
          reminder_days_before: plansMap.get(occ.plan_id)!.reminder_days_before ?? 2,
          status: plansMap.get(occ.plan_id)!.status || 'pending',
        } as RecurringPlan : null,
      }));
    },
  });

  // Mark a plan's current occurrence as paid
  const markAsPaidMutation = useMutation({
    mutationFn: async ({ 
      planId, 
      bankAccountId,
      occurrenceDate,
      amount,
      frequency,
    }: { 
      planId: string; 
      bankAccountId: string;
      occurrenceDate: string;
      amount: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create the paid occurrence
      const { error: occError } = await supabase
        .from('recurring_occurrences')
        .insert({
          plan_id: planId,
          user_id: user.id,
          occurrence_date: occurrenceDate,
          amount,
          status: 'paid',
          bank_account_id: bankAccountId,
        });

      if (occError) throw occError;

      // 2. Calculate and update next due date
      const newDueDate = calculateNextDueDate(occurrenceDate, frequency);
      
      const { error: planError } = await supabase
        .from('recurring_transactions')
        .update({
          next_due_date: newDueDate,
          last_done_date: occurrenceDate,
          bank_account_id: bankAccountId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (planError) throw planError;

      // 3. Create expense record for tracking
      const { data: plan } = await supabase
        .from('recurring_transactions')
        .select('name, category, currency')
        .eq('id', planId)
        .single();

      if (plan) {
        await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            amount,
            category: plan.category,
            description: `${plan.name} (Recurring)`,
            date: new Date().toISOString(),
            currency: plan.currency,
            bank_account_id: bankAccountId,
          });
      }

      return { newDueDate };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Marked as paid', description: 'Payment recorded and next due date updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Skip an occurrence without paying
  const skipOccurrenceMutation = useMutation({
    mutationFn: async ({
      planId,
      occurrenceDate,
      amount,
      frequency,
      notes,
    }: {
      planId: string;
      occurrenceDate: string;
      amount: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create the skipped occurrence
      const { error: occError } = await supabase
        .from('recurring_occurrences')
        .insert({
          plan_id: planId,
          user_id: user.id,
          occurrence_date: occurrenceDate,
          amount,
          status: 'skipped',
          notes: notes || 'Skipped by user',
        });

      if (occError) throw occError;

      // 2. Advance the plan's next due date
      const newDueDate = calculateNextDueDate(occurrenceDate, frequency);
      
      const { error: planError } = await supabase
        .from('recurring_transactions')
        .update({
          next_due_date: newDueDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (planError) throw planError;

      return { newDueDate };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-occurrences'] });
      toast({ title: 'Occurrence skipped', description: 'Moved to next due date.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    completedOccurrences,
    isLoadingCompleted,
    completedError,
    markAsPaid: markAsPaidMutation.mutate,
    skipOccurrence: skipOccurrenceMutation.mutate,
    isMarkingPaid: markAsPaidMutation.isPending,
    isSkipping: skipOccurrenceMutation.isPending,
  };
}
