import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FILE_UPLOAD_CONFIG, FILE_UPLOAD_MESSAGES } from '@/constants/fileUpload';
import { createFileUploadFormData, validateFile } from '@/utils/fileUtils';
import type { StatementImportResult, StatementImportError } from '@/types/statementImport';

/**
 * Custom hook for importing bank statements using AI
 * Handles file upload, validation, API calls, and state management
 */
export const useStatementImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);

  // Ref to store abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Import a bank statement file
   * @param bankAccountId - ID of the bank account
   * @param file - Statement file to import
   * @returns Import result or null on failure
   */
  const importStatement = useCallback(
    async (bankAccountId: string, file: File): Promise<StatementImportResult | null> => {
      // Validate inputs
      if (!bankAccountId) {
        const error = FILE_UPLOAD_MESSAGES.ERRORS.NO_BANK_SELECTED;
        setError(error);
        toast({
          title: 'Validation Error',
          description: error,
          variant: 'destructive',
        });
        return null;
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error!);
        toast({
          title: 'Invalid File',
          description: validation.error,
          variant: 'destructive',
        });
        return null;
      }

      setIsImporting(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Get session for auth header
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error(FILE_UPLOAD_MESSAGES.ERRORS.NOT_AUTHENTICATED);
        }

        // Create form data
        const formData = createFileUploadFormData(bankAccountId, file);

        // Call edge function with timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, FILE_UPLOAD_CONFIG.REQUEST_TIMEOUT);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-statement`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
            signal: abortControllerRef.current.signal,
          }
        );

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          const errorData = data as StatementImportError;
          throw new Error(errorData.error || FILE_UPLOAD_MESSAGES.ERRORS.UPLOAD_FAILED);
        }

        // Only update state if component is still mounted
        if (!isMountedRef.current) return null;

        // Invalidate related queries to refresh data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['expenses'] }),
          queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }),
          queryClient.invalidateQueries({ queryKey: ['import-history'] }),
        ]);

        toast({
          title: FILE_UPLOAD_MESSAGES.SUCCESS.IMPORT_COMPLETE,
          description: data.message,
        });

        return data as StatementImportResult;
      } catch (err) {
        // Only update state if component is still mounted
        if (!isMountedRef.current) return null;

        let errorMessage = FILE_UPLOAD_MESSAGES.ERRORS.UPLOAD_FAILED;

        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Request timed out. Please try again.';
          } else if (err.message.includes('fetch')) {
            errorMessage = FILE_UPLOAD_MESSAGES.ERRORS.NETWORK_ERROR;
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        toast({
          title: 'Import Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsImporting(false);
        }
        abortControllerRef.current = null;
      }
    },
    [queryClient, toast]
  );

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    importStatement,
    isImporting,
    error,
    clearError,
  };
};
