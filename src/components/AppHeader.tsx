
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AppHeaderProps {
  user?: User | null;
  showSignOut?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, showSignOut = false }) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Personal Finance Tracker
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Track, analyze, and manage your complete financial picture
            </p>
          </div>
          {showSignOut && user && (
            <div className="hidden md:flex items-center space-x-4">
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="User avatar" />
                      <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logged in as: {user.email}</p>
                  </TooltipContent>
                </Tooltip>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
