
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecurringTransaction, RecurringTransactionFormData, EditRecurringTransactionData } from '@/types/recurringTransaction';
import { useToast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

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

  // Get upcoming reminders (due within the next 7 days)
  const getUpcomingReminders = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return recurringTransactions.filter(transaction => {
      const dueDate = new Date(transaction.next_due_date);
      const reminderDate = addDays(dueDate, -transaction.reminder_days_before);
      return reminderDate <= today && dueDate <= nextWeek;
    });
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

      // Update next due date
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
    getUpcomingReminders,
    processRecurringTransactions,
    isAdding: addRecurringTransactionMutation.isPending,
    isUpdating: updateRecurringTransactionMutation.isPending,
  };
};
