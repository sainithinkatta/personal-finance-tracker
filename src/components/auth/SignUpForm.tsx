import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { PasswordStrengthMeter, isPasswordValid } from './PasswordStrengthMeter';
import { CapsLockWarning } from './CapsLockWarning';
import { cn } from '@/lib/utils';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Email validation
  const isEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // Check if form is valid
  const isFormValid = isEmailValid && isPasswordValid(password);

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!isEmailValid) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail() || !isPasswordValid(password)) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast({
            title: 'Account exists',
            description: 'An account with this email already exists. Please sign in instead.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      // Store email for verification page
      sessionStorage.setItem('pending_verification_email', email);
      
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });

      // Navigate to verification page
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred during sign up.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) validateEmail();
            }}
            onBlur={() => {
              setTouched(prev => ({ ...prev, email: true }));
              validateEmail();
            }}
            className={cn(
              'pl-10 h-11',
              touched.email && emailError && 'border-destructive focus-visible:ring-destructive'
            )}
            required
            autoComplete="email"
          />
        </div>
        {touched.email && emailError && (
          <p className="text-xs text-destructive">{emailError}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setTouched(prev => ({ ...prev, password: true }));
            }}
            className="pl-10 pr-10 h-11"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>
        <CapsLockWarning />
        {touched.password && <PasswordStrengthMeter password={password} showRules={true} />}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary/90"
        disabled={loading || !isFormValid}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Switch to Login */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">
            Already have an account?
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full h-11"
        onClick={onSwitchToLogin}
      >
        Sign In
      </Button>
    </form>
  );
};
