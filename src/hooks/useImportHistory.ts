import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ImportHistoryItem {
  id: string;
  user_id: string;
  bank_account_id: string;
  file_name: string;
  file_size: number;
  imported_count: number;
  skipped_count: number;
  duplicate_count: number;
  imported_at: string;
  bank_account?: {
    name: string | null;
  };
}

export const useImportHistory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: importHistory = [], isLoading, error } = useQuery({
    queryKey: ['import-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_history')
        .select(`
          *,
          bank_account:bank_accounts(name)
        `)
        .order('imported_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ImportHistoryItem[];
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: async (historyId: string) => {
      const { error } = await supabase
        .from('import_history')
        .delete()
        .eq('id', historyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      toast({
        title: 'History deleted',
        description: 'Import history record removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete history',
        variant: 'destructive',
      });
    },
  });

  return {
    importHistory,
    isLoading,
    error,
    deleteHistory: deleteHistoryMutation.mutate,
    isDeleting: deleteHistoryMutation.isPending,
  };
};
