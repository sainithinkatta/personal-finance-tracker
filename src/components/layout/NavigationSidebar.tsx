import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  Repeat,
  Clock,
  TrendingUp,
  Landmark,
  LogOut,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSignOut } from '@/hooks/useSignOut';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NavigationSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isExpanded: boolean;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
  { id: 'budget', label: 'Budget', icon: PiggyBank },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'dues', label: 'Dues', icon: Clock },
  { id: 'savings', label: 'Savings', icon: TrendingUp },
  { id: 'loan', label: 'Loans', icon: Landmark },
];

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onTabChange,
  isExpanded,
}) => {
  const { signOut } = useSignOut();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-200/60 transition-all duration-300 ease-in-out overflow-y-auto',
        isExpanded ? 'w-[200px]' : 'w-[56px]'
      )}
    >
      <nav className="flex-1 py-2">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const navButton = (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-white' : 'text-gray-500')} />
                {isExpanded && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );

            // When collapsed, wrap button in tooltip
            if (!isExpanded) {
              return (
                <li key={item.id}>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      {navButton}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.id}>{navButton}</li>;
          })}
        </ul>
      </nav>

      <div className="mt-auto px-2 pb-3">
        {isExpanded ? (
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="truncate">Log out</span>
          </button>
        ) : (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Log out
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logging out ?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
              onClick={() => {
                setIsLogoutOpen(false);
                signOut();
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};

export default NavigationSidebar;
