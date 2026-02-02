/**
 * =====================================================
 * CONTENT HEADER
 * =====================================================
 * 
 * Shows page title, subtitle, and tab-specific actions.
 * The "Recurring" tab includes an "Add Transaction" button.
 */

import React, { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { AddPlanDialog } from '@/components/recurring/dialogs/AddPlanDialog';

interface ContentHeaderProps {
    activeTab: string;
    selectedCurrency: string;
    onCurrencyChange: (currency: string) => void;
    selectedMonth?: number;
    selectedYear?: number;
    onMonthChange?: (month: number) => void;
    onYearChange?: (year: number) => void;
}

const tabTitles: Record<string, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Overview', subtitle: '' }, // Will be set dynamically
    expenses: { title: 'Expenses', subtitle: 'Track and manage your spending' },
    accounts: { title: 'Accounts', subtitle: 'Manage your bank accounts and cards' },
    budget: { title: 'Budget', subtitle: 'Create and manage your monthly budgets' },
    recurring: { title: 'Recurring', subtitle: 'Manage recurring transactions' },
    dues: { title: 'Dues', subtitle: 'Track your personal financial obligations' },
    savings: { title: 'Savings', subtitle: 'Track your savings goals' },
    loan: { title: 'Loan', subtitle: 'Track and project your loan repayment' },
};

// Month names for dropdown options
const MONTHS = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
];

// Generate year options (2020 to current year + 1)
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
        years.push(year);
    }
    return years;
};

const ContentHeader: React.FC<ContentHeaderProps> = ({
    activeTab,
    selectedCurrency,
    onCurrencyChange,
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
}) => {
    const { title } = tabTitles[activeTab] || { title: 'Dashboard', subtitle: '' };
    const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);

    // Generate dynamic subtitle for dashboard based on selected month/year
    const currentDate = new Date();
    const displayMonth = selectedMonth ?? currentDate.getMonth();
    const displayYear = selectedYear ?? currentDate.getFullYear();
    const dashboardSubtitle = `Your financial snapshot for ${format(new Date(displayYear, displayMonth), 'MMM yyyy').toUpperCase()}`;

    const subtitle = activeTab === 'dashboard' ? dashboardSubtitle : tabTitles[activeTab]?.subtitle;

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
                
                {/* Dashboard: Month, Year, and Currency selectors */}
                {activeTab === 'dashboard' && (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Month Selector */}
                        <Select
                            value={displayMonth.toString()}
                            onValueChange={(value) => onMonthChange?.(parseInt(value))}
                        >
                            <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200 text-sm">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((month) => (
                                    <SelectItem key={month.value} value={month.value.toString()}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Year Selector */}
                        <Select
                            value={displayYear.toString()}
                            onValueChange={(value) => onYearChange?.(parseInt(value))}
                        >
                            <SelectTrigger className="w-[100px] h-9 bg-white border-gray-200 text-sm">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {generateYearOptions().map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Currency Selector */}
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

                {/* Recurring: Add Transaction button */}
                {activeTab === 'recurring' && (
                    <Button
                        onClick={() => setIsAddPlanOpen(true)}
                        className="gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Transaction</span>
                    </Button>
                )}
            </div>

            {/* Add Plan Dialog - only rendered when on recurring tab */}
            {activeTab === 'recurring' && (
                <AddPlanDialog
                    isOpen={isAddPlanOpen}
                    onClose={() => setIsAddPlanOpen(false)}
                />
            )}
        </>
    );
};

export default ContentHeader;
