import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';

const PasswordReset: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error parameters in the URL hash
    const checkForErrors = () => {
      const hash = window.location.hash;
      if (hash.includes('error=')) {
        const urlParams = new URLSearchParams(hash.substring(1));
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error === 'otp_expired' || error === 'access_denied') {
          setHasError(true);
          setErrorMessage('The password reset link has expired or is invalid. Please request a new one.');
          return;
        }
      }
    };

    checkForErrors();

    // Check if user arrived here via password reset link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setHasError(true);
          setErrorMessage('There was an error verifying your reset token. Please try requesting a new password reset.');
          return;
        }

        if (session) {
          setIsValidSession(true);
        } else {
          // Check if we're in the middle of a password reset flow
          const hash = window.location.hash;
          if (hash.includes('access_token=')) {
            // Wait a moment for Supabase to process the token
            setTimeout(async () => {
              const { data: { session: newSession } } = await supabase.auth.getSession();
              if (newSession) {
                setIsValidSession(true);
              } else {
                setHasError(true);
                setErrorMessage('Unable to verify reset token. Please request a new password reset.');
              }
            }, 1000);
          } else {
            setHasError(true);
            setErrorMessage('No valid reset session found. Please request a new password reset.');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setHasError(true);
        setErrorMessage('There was an error verifying your reset session.');
      }
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: 'Password Updated!',
        description: 'Your password has been successfully updated. You are now logged in.',
      });

      // Redirect to dashboard after successful password reset
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Reset Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewReset = () => {
    navigate('/');
  };

  if (hasError) {
    return (
      <div>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Reset Link Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{errorMessage}</p>
              <Button onClick={handleRequestNewReset} className="w-full">
                Request New Password Reset
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Verifying reset token...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
