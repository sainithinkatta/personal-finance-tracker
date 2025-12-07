import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecurringTransaction, RecurringTransactionFormData, EditRecurringTransactionData } from '@/types/recurringTransaction';
import { useToast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { computeRecurringStatus, ComputedStatus } from '@/utils/recurringStatusUtils';

interface RecurringTransactionsFilters {
  searchText?: string;
  status?: 'pending' | 'upcoming' | 'done' | 'all';
  bankAccountId?: string;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string;   // YYYY-MM-DD format
  includeCompleted?: boolean;
  limit?: number;
  offset?: number;
}

// Extended type with computed status
export interface RecurringTransactionWithStatus extends RecurringTransaction {
  computedStatus: ComputedStatus;
}

export const useRecurringTransactions = (filters?: RecurringTransactionsFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: recurringTransactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recurring-transactions', filters],
    queryFn: async (): Promise<RecurringTransactionWithStatus[]> => {
      let query = supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_due_date', { ascending: true });

      // Apply search filter
      if (filters?.searchText) {
        query = query.ilike('name', `%${filters.searchText}%`);
      }

      // Apply bank account filter - only if it's a valid UUID (36 chars)
      if (filters?.bankAccountId && filters.bankAccountId.length === 36) {
        query = query.eq('bank_account_id', filters.bankAccountId);
      }

      // Apply date range filters on next_due_date
      if (filters?.startDate) {
        query = query.gte('next_due_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('next_due_date', filters.endDate);
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map data and compute status dynamically
      const mappedData: RecurringTransactionWithStatus[] = (data || []).map(item => {
        const computedStatus = computeRecurringStatus(item.status, item.next_due_date);
        return {
          id: item.id,
          user_id: item.user_id || '',
          name: item.name,
          amount: item.amount,
          category: item.category,
          frequency: item.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
          next_due_date: item.next_due_date,
          currency: item.currency,
          email_reminder: item.email_reminder ?? true,
          reminder_days_before: item.reminder_days_before ?? 2,
          status: item.status as 'pending' | 'done',
          last_done_date: item.last_done_date,
          last_reminder_sent_at: item.last_reminder_sent_at,
          bank_account_id: item.bank_account_id || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          computedStatus,
        };
      });

      // Filter based on computed status
      if (filters?.status && filters.status !== 'all') {
        return mappedData.filter(transaction => {
          if (filters.status === 'done') {
            return transaction.computedStatus === 'done';
          } else if (filters.status === 'pending') {
            return transaction.computedStatus === 'pending';
          } else if (filters.status === 'upcoming') {
            return transaction.computedStatus === 'upcoming';
          }
          return true;
        });
      } else if (!filters?.includeCompleted) {
        // Default: exclude completed unless explicitly requested
        return mappedData.filter(t => t.computedStatus !== 'done');
      }

      return mappedData;
    },
  });

  const addRecurringTransactionMutation = useMutation({
    mutationFn: async (transactionData: RecurringTransactionFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{ 
          ...transactionData, 
          user_id: user.id,
          status: 'pending' // New transactions start as pending (will be computed as upcoming/pending based on date)
        }])
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
    onError: () => {
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
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update recurring transaction. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const markAsDoneMutation = useMutation({
    mutationFn: async ({ id, bankAccountId }: { id: string; bankAccountId: string }) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ 
          status: 'done',
          last_done_date: format(new Date(), 'yyyy-MM-dd'),
          bank_account_id: bankAccountId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reminders'] });
      toast({
        title: 'Marked as Done',
        description: 'Transaction has been marked as completed.',
      });
    },
    onError: () => {
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
    onError: () => {
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
      if (transaction.computedStatus === 'done') return false;
      const dueDate = parseLocalDate(transaction.next_due_date);
      const reminderDate = addDays(dueDate, -transaction.reminder_days_before);
      return reminderDate <= today && dueDate <= nextWeek;
    });
  };

  const processRecurringTransactions = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dueTodayTransactions = recurringTransactions.filter(
      transaction => transaction.next_due_date === today && transaction.computedStatus !== 'done'
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
      const currentDueDate = parseLocalDate(transaction.next_due_date);
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
