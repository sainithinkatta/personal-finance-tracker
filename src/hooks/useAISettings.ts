import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AISettingsState {
  hasKey: boolean;
}

interface SaveKeyResult {
  success: boolean;
  error?: string;
}

interface RemoveKeyResult {
  success: boolean;
  error?: string;
}

/**
 * Hook for managing user AI settings (Gemini API key).
 * 
 * Features:
 * - Check if user has configured an API key
 * - Save a new API key (encrypted on backend)
 * - Remove the API key
 * 
 * SECURITY: The actual API key is never returned from the backend
 * after it's saved. Only a boolean "hasKey" status is exposed.
 */
export const useAISettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to check if user has a key configured
  const { data, isLoading, refetch } = useQuery<AISettingsState>({
    queryKey: ['ai-settings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { hasKey: false };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-ai-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'check' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check AI settings');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Mutation to save a new key
  const saveMutation = useMutation({
    mutationFn: async (key: string): Promise<SaveKeyResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-ai-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'save', key }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: result.message || result.error || 'Failed to save API key' 
        };
      }

      return { success: true };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
        toast({
          title: 'API key saved',
          description: 'Your Gemini API key has been securely stored.',
        });
      }
    },
  });

  // Mutation to remove the key
  const removeMutation = useMutation({
    mutationFn: async (): Promise<RemoveKeyResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-ai-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'remove' }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        return { success: false, error: result.error || 'Failed to remove API key' };
      }

      return { success: true };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
        toast({
          title: 'API key removed',
          description: 'Your Gemini API key has been removed.',
        });
      }
    },
  });

  const saveKey = useCallback(async (key: string): Promise<SaveKeyResult> => {
    return saveMutation.mutateAsync(key);
  }, [saveMutation]);

  const removeKey = useCallback(async (): Promise<RemoveKeyResult> => {
    return removeMutation.mutateAsync();
  }, [removeMutation]);

  return {
    hasKey: data?.hasKey ?? null, // null means loading
    isLoading,
    isSaving: saveMutation.isPending,
    isRemoving: removeMutation.isPending,
    saveKey,
    removeKey,
    refetch,
  };
};
