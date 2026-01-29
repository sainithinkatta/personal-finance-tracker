import React from 'react';
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
} from 'lucide-react';

interface MobileNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    variant?: 'list' | 'pills';
}

const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'budget', label: 'Budget', icon: PiggyBank },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'dues', label: 'Dues', icon: Clock },
    { id: 'savings', label: 'Savings', icon: TrendingUp },
    { id: 'loan', label: 'Loan', icon: Landmark },
];

const MobileNavigation: React.FC<MobileNavigationProps> = ({
    activeTab,
    onTabChange,
    variant = 'list',
}) => {
    if (variant === 'pills') {
        return (
            <div className="w-full overflow-x-auto no-scrollbar -mx-3 px-3">
                <div className="flex gap-2.5 w-max pb-1">
                    {navigationItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    'flex-none px-4 py-2 rounded-full text-sm font-medium border transition-all touch-target whitespace-nowrap',
                                    isActive
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                )}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // List variant for sheet/sidebar
    return (
        <nav className="flex-1 px-3">
            <ul className="space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <li key={item.id}>
                            <button
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-500')} />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default MobileNavigation;
