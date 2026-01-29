import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Wallet } from 'lucide-react';

const COOLDOWN_SECONDS = 60;

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);

  // Get email from URL params or sessionStorage
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const emailFromStorage = sessionStorage.getItem('pending_verification_email');

    const resolvedEmail = emailFromUrl || emailFromStorage || '';
    setEmail(resolvedEmail);

    // Store in sessionStorage if from URL
    if (emailFromUrl) {
      sessionStorage.setItem('pending_verification_email', emailFromUrl);
    }

    // Check if user is already verified and redirect to app
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.confirmed_at) {
        // User is already verified, redirect to app
        sessionStorage.removeItem('pending_verification_email');
        navigate('/app');
      }
    };

    checkVerification();
  }, [searchParams, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast({
        title: 'No email found',
        description: 'Please go back and sign up again.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) throw error;

      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
      toast({
        title: 'Email sent!',
        description: 'Please check your inbox for the verification link.',
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: 'Failed to resend',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('pending_verification_email');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-foreground">
            Fingo
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 sm:p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              Verify your email
            </h1>

            <p className="text-center text-muted-foreground mb-6">
              We've sent a verification link to{' '}
              {email ? (
                <strong className="text-foreground">{email}</strong>
              ) : (
                'your email address'
              )}
            </p>

            {/* Success message */}
            {sent && (
              <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg mb-6">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                <p className="text-sm text-accent-foreground">
                  Verification email sent successfully!
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground">
                Please check your inbox and click the verification link to activate your account.
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder or request a new one below.
              </p>
            </div>

            {/* Resend Button */}
            <Button
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              className="w-full h-11 mb-4 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                'Resend verification email'
              )}
            </Button>

            {/* Back to Login */}
            <Button
              variant="ghost"
              onClick={handleBackToLogin}
              className="w-full h-11"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
