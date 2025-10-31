
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RecurringTransaction, RecurringTransactionFormData, EditRecurringTransactionData } from '@/types/recurringTransaction';
import { useToast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { REMINDER_LOOKAHEAD_DAYS } from '@/config/notifications';
import { isWithinReminderWindow } from '@/lib/reminders';

export const useRecurringTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: recurringTransactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
  });

  // Set up real-time subscription for reminder updates
  useEffect(() => {
    const channel = supabase
      .channel('recurring-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'recurring_transactions',
        },
        () => {
          // Invalidate and refetch when any transaction is updated
          queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addRecurringTransactionMutation = useMutation({
    mutationFn: async (transactionData: RecurringTransactionFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{ ...transactionData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({
        title: 'Recurring Transaction Added',
        description: 'Your recurring transaction has been set up successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add recurring transaction. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateRecurringTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: EditRecurringTransactionData) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({
        title: 'Recurring Transaction Updated',
        description: 'Your recurring transaction has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update recurring transaction. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const markAsDoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ 
          status: 'done',
          last_done_date: format(new Date(), 'yyyy-MM-dd'),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI updates everywhere
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reminders'] });
      toast({
        title: 'Marked as Done',
        description: 'Transaction has been marked as completed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark transaction as done. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteRecurringTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({
        title: 'Recurring Transaction Deleted',
        description: 'The recurring transaction has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete recurring transaction. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Get upcoming reminders within the configured lookahead window
  const getUpcomingReminders = () => {
    const today = new Date();

    return recurringTransactions.filter(transaction =>
      isWithinReminderWindow(transaction, today, REMINDER_LOOKAHEAD_DAYS)
    );
  };

  const processRecurringTransactions = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dueTodayTransactions = recurringTransactions.filter(
      transaction => transaction.next_due_date === today
    );

    for (const transaction of dueTodayTransactions) {
      // Add expense entry
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) continue;

      await supabase.from('expenses').insert([{
        user_id: user.id,
        amount: transaction.amount,
        category: transaction.category,
        description: `${transaction.name} (Recurring)`,
        currency: transaction.currency,
        date: today,
      }]);

      // Update next due date and reset status
      const currentDueDate = new Date(transaction.next_due_date);
      let nextDueDate: Date;

      switch (transaction.frequency) {
        case 'daily':
          nextDueDate = addDays(currentDueDate, 1);
          break;
        case 'weekly':
          nextDueDate = addWeeks(currentDueDate, 1);
          break;
        case 'monthly':
          nextDueDate = addMonths(currentDueDate, 1);
          break;
        case 'yearly':
          nextDueDate = addYears(currentDueDate, 1);
          break;
        default:
          nextDueDate = addMonths(currentDueDate, 1);
      }

      await supabase
        .from('recurring_transactions')
        .update({ 
          next_due_date: format(nextDueDate, 'yyyy-MM-dd'),
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);
    }

    queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  return {
    recurringTransactions,
    isLoading,
    error,
    addRecurringTransaction: addRecurringTransactionMutation.mutate,
    updateRecurringTransaction: updateRecurringTransactionMutation.mutate,
    deleteRecurringTransaction: deleteRecurringTransactionMutation.mutate,
    markAsDone: markAsDoneMutation.mutate,
    getUpcomingReminders,
    processRecurringTransactions,
    isAdding: addRecurringTransactionMutation.isPending,
    isUpdating: updateRecurringTransactionMutation.isPending,
    isMarkingDone: markAsDoneMutation.isPending,
  };
};
