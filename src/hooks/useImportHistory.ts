import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FILE_UPLOAD_CONFIG, FILE_UPLOAD_MESSAGES } from '@/constants/fileUpload';
import type { ImportHistoryItem } from '@/types/statementImport';

/**
 * Custom hook for managing import history
 * Fetches and manages the history of statement imports
 */
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
        .limit(FILE_UPLOAD_CONFIG.HISTORY_LIMIT);

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
        title: 'History Deleted',
        description: FILE_UPLOAD_MESSAGES.SUCCESS.HISTORY_DELETED,
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
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
