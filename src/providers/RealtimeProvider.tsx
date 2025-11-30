import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * RealtimeProvider - Centralized real-time subscription management
 *
 * This provider sets up Supabase real-time subscriptions at the app level
 * to avoid duplicate subscriptions when multiple components use the same hooks.
 *
 * Currently handles:
 * - recurring_transactions table updates
 */
export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Single subscription for recurring transactions updates
    const recurringTransactionsChannel = supabase
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

    // Cleanup function to remove channel on unmount
    return () => {
      supabase.removeChannel(recurringTransactionsChannel);
    };
  }, [queryClient]);

  return <>{children}</>;
};
