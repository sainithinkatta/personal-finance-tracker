import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';

interface ContentHeaderProps {
    activeTab: string;
    selectedCurrency: string;
    onCurrencyChange: (currency: string) => void;
}

const tabTitles: Record<string, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Overview', subtitle: `Your financial snapshot for ${format(new Date(), 'MMM yyyy').toUpperCase()}` },
    expenses: { title: 'Expenses', subtitle: 'Track and manage your spending' },
    accounts: { title: 'Accounts', subtitle: 'Manage your bank accounts and cards' },
    budget: { title: 'Budget', subtitle: 'Create and manage your monthly budgets' },
    recurring: { title: 'Recurring', subtitle: 'Manage recurring transactions' },
    dues: { title: 'Dues', subtitle: 'Track your personal financial obligations' },
    savings: { title: 'Savings', subtitle: 'Track your savings goals' },
    loan: { title: 'Loan', subtitle: 'Track and project your loan repayment' },
    credit: { title: 'Credit', subtitle: 'Payoff planner for your credit card dues' },
};

const ContentHeader: React.FC<ContentHeaderProps> = ({
    activeTab,
    selectedCurrency,
    onCurrencyChange,
}) => {
    const { title, subtitle } = tabTitles[activeTab] || { title: 'Dashboard', subtitle: '' };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="space-y-0.5">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
            {activeTab === 'dashboard' && (
                <div>
                    <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
                        <SelectTrigger className="w-[110px] h-9 bg-white border-gray-200 text-sm">
                            <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                    {currency.symbol} {currency.code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
};

export default ContentHeader;
