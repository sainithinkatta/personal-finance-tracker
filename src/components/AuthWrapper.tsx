

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from './AppHeader';
import { Eye, EyeOff } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  if (loading) {
    return (
      <div>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {showForgotPassword ? 'Reset Password' : (isLogin ? 'Login' : 'Sign Up')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-full" disabled={authLoading}>
                    {authLoading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
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
                  />
                  <div className="relative">
                    <Input
                      type={isLogin ? (showLoginPassword ? "text" : "password") : (showSignupPassword ? "text" : "password")}
                      placeholder="Password"
                      value={isLogin ? loginPassword : signupPassword}
                      onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
                      required
                      className="pr-10"
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
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                  </Button>
                  {isLogin && (
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm text-blue-500 hover:text-blue-600"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot Password?
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader user={user} showSignOut={true} />
      {children}
    </div>
  );
};

export default AuthWrapper;

