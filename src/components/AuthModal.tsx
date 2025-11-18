import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Separate state for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Separate state for signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot password email state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const { toast } = useToast();

  // Reset form when switching modes
  React.useEffect(() => {
    setIsLogin(defaultMode === 'login');
  }, [defaultMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (error) throw error;
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.',
        });
        // Close modal and redirect to app
        onClose();
        navigate('/app');
      } else {
        const { error } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          }
        });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        // Close modal after signup
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Reset email sent!',
        description: 'Please check your email for password reset instructions.',
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: 'Reset Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset all states when closing
      setShowForgotPassword(false);
      setLoginEmail('');
      setLoginPassword('');
      setSignupEmail('');
      setSignupPassword('');
      setForgotPasswordEmail('');
      setShowLoginPassword(false);
      setShowSignupPassword(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {showForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </DialogTitle>
          {!showForgotPassword && (
            <p className="text-sm text-gray-600 text-center mt-2">
              {isLogin
                ? 'Sign in to access your financial dashboard'
                : 'Start tracking your finances today'}
            </p>
          )}
        </DialogHeader>

        <div className="mt-4">
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="h-11"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full h-11"
                disabled={authLoading}
              >
                {authLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={isLogin ? loginEmail : signupEmail}
                onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)}
                required
                className="h-11"
              />
              <div className="relative">
                <Input
                  type={isLogin ? (showLoginPassword ? "text" : "password") : (showSignupPassword ? "text" : "password")}
                  placeholder="Password"
                  value={isLogin ? loginPassword : signupPassword}
                  onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
                  required
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => isLogin ? setShowLoginPassword(!showLoginPassword) : setShowSignupPassword(!showSignupPassword)}
                >
                  {(isLogin ? showLoginPassword : showSignupPassword) ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                disabled={authLoading}
              >
                {authLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
              {isLogin && (
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </Button>
              )}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
