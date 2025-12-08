import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Shared sign out hook
 *
 * Provides consistent sign out logic across all components
 * Handles:
 * - Supabase auth sign out
 * - React Query cache clearing
 * - Session storage cleanup
 * - Navigation to landing page
 * - User feedback via toast
 */
export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all React Query cache
      queryClient.clear();

      // Clear session storage keys used for auth flows
      sessionStorage.removeItem('pending_verification_email');

      // Show success message
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });

      // Navigate to landing page
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { signOut };
}
