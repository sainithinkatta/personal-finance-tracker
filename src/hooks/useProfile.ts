import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAvatarFile, getAvatarFilePath } from '@/utils/avatarValidation';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

const PROFILE_QUERY_KEY = 'profile';

export function useProfile(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query for profile fetching with proper cache control
  const { 
    data: profile, 
    isLoading: loading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }
      
      return data as Profile | null;
    },
    enabled: !!userId,
    staleTime: 0, // Always consider stale - ensures fresh data on mount
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
  });

  // Function to invalidate profile cache - call this after updating profile
  const invalidateProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, userId] });
  }, [queryClient, userId]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'avatar_url' | 'onboarding_completed'>>) => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Invalidate and refetch profile after update
      await invalidateProfile();
      await refetch();
      
      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      return { error };
    }
  };

  const uploadAvatar = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!userId) return { url: null, error: new Error('No user ID') };

    try {
      // Validate file using shared utility
      const validation = validateAvatarFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // SECURITY: Derive file extension from validated MIME type, NOT from filename
      const filePath = getAvatarFilePath(userId, file.type);

      // Clean up old avatar files before uploading new one
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filePaths = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(filePaths);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Use updated_at timestamp for consistent cache busting
      const timestamp = new Date().toISOString();
      const urlWithCacheBust = `${publicUrl}?v=${timestamp}`;

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: urlWithCacheBust });
      if (updateError) throw updateError;

      return { url: urlWithCacheBust, error: null };
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const error = err instanceof Error ? err : new Error('Failed to upload avatar');
      return { url: null, error };
    }
  };

  const removeAvatar = async (): Promise<{ error: Error | null }> => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      // List files in user's avatar folder
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(userId);

      // Delete all avatar files for this user
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(filePaths);
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: null });
      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      console.error('Error removing avatar:', err);
      const error = err instanceof Error ? err : new Error('Failed to remove avatar');
      return { error };
    }
  };

  // User needs onboarding only if profile exists and onboarding_completed is explicitly false
  // Must check for both null AND undefined since React Query returns undefined while loading
  const needsOnboarding = profile != null && profile.onboarding_completed === false;

  return {
    profile: profile ?? null,
    loading,
    error: error instanceof Error ? error : null,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    refetch,
    invalidateProfile,
    needsOnboarding,
  };
}
