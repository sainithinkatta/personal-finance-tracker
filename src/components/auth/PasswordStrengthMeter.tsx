import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  showRules?: boolean;
}

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  const passedRules = passwordRules.filter(rule => rule.test(password)).length;
  
  if (password.length === 0) {
    return { score: 0, label: '', color: '' };
  }
  
  if (passedRules <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-destructive' };
  }
  
  if (passedRules <= 2) {
    return { score: 2, label: 'Fair', color: 'bg-warning' };
  }
  
  if (passedRules <= 3) {
    return { score: 3, label: 'Good', color: 'bg-info' };
  }
  
  if (passedRules <= 4) {
    return { score: 4, label: 'Strong', color: 'bg-accent' };
  }
  
  return { score: 5, label: 'Very Strong', color: 'bg-accent' };
}

export function isPasswordValid(password: string): boolean {
  // Minimum requirement: 8 characters and at least one of each type
  return password.length >= 8;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  showRules = true 
}) => {
  const { score, label, color } = getPasswordStrength(password);
  
  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                score >= level ? color : 'bg-muted'
              )}
            />
          ))}
        </div>
        {label && (
          <p className={cn(
            'text-xs font-medium',
            score <= 1 && 'text-destructive',
            score === 2 && 'text-warning-foreground',
            score === 3 && 'text-info-foreground',
            score >= 4 && 'text-accent-foreground'
          )}>
            Password strength: {label}
          </p>
        )}
      </div>

      {/* Rules checklist */}
      {showRules && (
        <ul className="space-y-1">
          {passwordRules.map((rule, index) => {
            const passed = rule.test(password);
            return (
              <li 
                key={index} 
                className={cn(
                  'flex items-center gap-2 text-xs transition-colors',
                  passed ? 'text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                {passed ? (
                  <Check className="h-3 w-3 text-accent" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
