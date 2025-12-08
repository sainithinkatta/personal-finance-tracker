import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, skipOnboardingCheck = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use getUser() for authoritative data
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(user);
        // Check confirmed_at for verification status
        setVerified(!!user.confirmed_at);
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setVerified(!!session.user.confirmed_at);
      } else {
        setUser(null);
        setVerified(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Get profile for onboarding check
  const { profile, loading: profileLoading, needsOnboarding } = useProfile(user?.id);

  // Show loading state while auth is loading OR while profile is loading  
  const isStillLoading = loading || (user && profileLoading);

  if (isStillLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to landing
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not verified - redirect to verify email
  if (!verified) {
    sessionStorage.setItem('pending_verification_email', user.email || '');
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || '')}`} replace />;
  }

  // Needs onboarding - redirect (unless we're already on onboarding or skipping check)
  // No navigation state workaround needed - React Query cache is properly invalidated after onboarding
  if (!skipOnboardingCheck && needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
