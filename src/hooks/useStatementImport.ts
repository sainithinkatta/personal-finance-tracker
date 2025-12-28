import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  imported_count: number;
  skipped_count: number;
  duplicate_count: number;
  message: string;
}

export const useStatementImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importStatement = async (bankAccountId: string, file: File): Promise<ImportResult | null> => {
    setIsImporting(true);
    setError(null);

    try {
      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Create form data
      const formData = new FormData();
      formData.append('bank_account_id', bankAccountId);
      formData.append('file', file);

      // Call edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-statement`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import statement');
      }

      // Invalidate expenses query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });

      toast({
        title: 'Statement imported',
        description: data.message,
      });

      return data as ImportResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import statement';
      setError(errorMessage);
      toast({
        title: 'Import failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importStatement,
    isImporting,
    error,
    clearError: () => setError(null),
  };
};
