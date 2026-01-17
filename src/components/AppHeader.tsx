import React from 'react';
import { User } from '@supabase/supabase-js';
import { UserMenu } from './layout/UserMenu';
import { Wallet } from 'lucide-react';

interface AppHeaderProps {
  user?: User | null;
  showSignOut?: boolean;
}

// Finmate Logo SVG Component
const FinmateLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="14" width="4" height="6" rx="1" fill="white" />
    <rect x="10" y="10" width="4" height="10" rx="1" fill="white" />
    <rect x="16" y="4" width="4" height="16" rx="1" fill="white" />
    <path d="M6 12L12 8L18 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <path d="M15 3H18V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
  </svg>
);

export const AppHeader: React.FC<AppHeaderProps> = ({ user, showSignOut = false }) => {
  return (
    <header className="hidden lg:block bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FinmateLogo />
            <div>
              <h1 className="text-2xl font-bold text-primary">
                FinMate
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track, analyze and manage your complete finances
              </p>
            </div>
          </div>
          {showSignOut && user && (
            <UserMenu user={user} />
          )}
        </div>
      </div>
    </header>
  );
};
