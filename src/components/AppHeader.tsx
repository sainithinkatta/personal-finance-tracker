import React from 'react';
import { User } from '@supabase/supabase-js';
import { UserMenu } from './layout/UserMenu';
import { Wallet } from 'lucide-react';

interface AppHeaderProps {
  user?: User | null;
  showSignOut?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, showSignOut = false }) => {
  return (
    <header className="hidden lg:block bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">
                FinMate
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track, analyze, and manage your complete financial picture
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
