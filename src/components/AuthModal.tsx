import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignUpForm } from './auth/SignUpForm';
import { LoginForm } from './auth/LoginForm';
import { ForgotPasswordForm } from './auth/ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [view, setView] = useState<AuthView>(defaultMode);

  // Reset view when modal opens with new default mode
  React.useEffect(() => {
    if (isOpen) {
      setView(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset to login after close
      setTimeout(() => setView('login'), 200);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'signup':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      default:
        return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'signup':
        return 'Start tracking your finances today';
      case 'forgot-password':
        return null;
      default:
        return 'Sign in to access your financial dashboard';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {getTitle()}
          </DialogTitle>
          {getSubtitle() && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              {getSubtitle()}
            </p>
          )}
        </DialogHeader>

        <div className="mt-4">
          {view === 'login' && (
            <LoginForm
              onSwitchToSignUp={() => setView('signup')}
              onForgotPassword={() => setView('forgot-password')}
              onSuccess={onClose}
            />
          )}
          
          {view === 'signup' && (
            <SignUpForm
              onSwitchToLogin={() => setView('login')}
            />
          )}
          
          {view === 'forgot-password' && (
            <ForgotPasswordForm
              onBack={() => setView('login')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
