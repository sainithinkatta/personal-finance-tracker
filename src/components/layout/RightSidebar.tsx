import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, TrendingUp } from 'lucide-react';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useExpenses } from '@/hooks/useExpenses';
import { format, differenceInDays, addDays } from 'date-fns';
import { CURRENCIES } from '@/types/expense';
import { parseLocalDate } from '@/utils/dateUtils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ExpenseForm from '@/components/ExpenseForm';
import AddIncomeModal from '@/components/AddIncomeModal';

const RightSidebar: React.FC = () => {
    const { getUpcomingReminders } = useRecurringTransactions();
    const { bankAccounts } = useBankAccounts();
    const { addExpense } = useExpenses();
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);

    // Filter out transactions that are marked as 'done' from upcoming reminders
    const upcomingReminders = getUpcomingReminders().filter(tx => tx.status !== 'done');

    const handleAddExpense = (expense: any) => {
        addExpense(expense);
        setIsAddExpenseOpen(false);
    };

    const formatCurrency = (amount: number, currency: string) => {
        const currencyInfo = CURRENCIES.find(c => c.code === currency);
        return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
    };

    // Get upcoming credit card payments
    const getUpcomingCreditPayments = () => {
        const today = new Date();
        const nextWeek = addDays(today, 7);

        return bankAccounts
            .filter(account => account.account_type === 'Credit' && account.payment_due_date)
            .map(account => {
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const dueDate = new Date(currentYear, currentMonth, account.payment_due_date!);

                // If due date has passed this month, move to next month
                if (dueDate < today) {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                }

                const dueAmount = (account.credit_limit || 0) - (account.available_balance || 0);

                return {
                    id: account.id,
                    name: `${account.name} - Credit`,
                    amount: dueAmount,
                    currency: account.currency,
                    next_due_date: dueDate.toISOString(),
                    status: 'pending' as const,
                    last_done_date: null,
                    isCredit: true,
                };
            })
            .filter(payment => {
                const dueDate = parseLocalDate(payment.next_due_date);
                return dueDate <= nextWeek && payment.amount > 0;
            });
    };

    const upcomingCreditPayments = getUpcomingCreditPayments();
    const allUpcomingPayments = [
        ...upcomingReminders.map(r => ({ ...r, isCredit: false })),
        ...upcomingCreditPayments,
    ];

    const getRelativeTime = (daysUntilDue: number) => {
        if (daysUntilDue === 0) return '(Today)';
        if (daysUntilDue === 1) return '(Tomorrow)';
        return `(${daysUntilDue} days)`;
    };

    return (
        <aside className="hidden xl:flex flex-col w-[220px] flex-shrink-0 p-4 space-y-4 border-l border-gray-200/60 bg-white overflow-y-auto">
            {/* Add Expense Button - Green Gradient */}
            <Button
                onClick={() => setIsAddExpenseOpen(true)}
                className="w-full h-11 text-sm font-medium shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
            >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
            </Button>

            {/* Add Income Button - White with border */}
            <Button
                onClick={() => setIsAddIncomeOpen(true)}
                variant="outline"
                className="w-full h-11 text-sm font-medium bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
                <TrendingUp className="h-5 w-5 mr-2" />
                Add Income
            </Button>

            {/* Upcoming Payments Section */}
            <Card className="rounded-lg shadow-sm border-gray-200/60">
                <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Upcoming Payments
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    {allUpcomingPayments.length > 0 ? (
                        <div className="space-y-2">
                            {allUpcomingPayments.map((payment) => {
                                const daysUntilDue = differenceInDays(parseLocalDate(payment.next_due_date), new Date());

                                return (
                                    <div
                                        key={payment.id}
                                        className="p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                                    >
                                        <h4 className="text-xs font-medium text-gray-900 truncate mb-1">
                                            {payment.name}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 mb-1">
                                            Due: {format(parseLocalDate(payment.next_due_date), 'MMM d, yyyy')}{' '}
                                            <span className="text-gray-400">{getRelativeTime(daysUntilDue)}</span>
                                        </p>
                                        <p className={`text-sm font-semibold ${payment.isCredit ? 'text-red-500' : 'text-green-600'}`}>
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs text-gray-400">No payments due in the next 7 days</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Dialog */}
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <ExpenseForm
                        onAddExpense={handleAddExpense}
                        onClose={() => setIsAddExpenseOpen(false)}
                        bankAccounts={bankAccounts}
                    />
                </DialogContent>
            </Dialog>

            {/* Add Income Modal */}
            <AddIncomeModal
                open={isAddIncomeOpen}
                onOpenChange={setIsAddIncomeOpen}
            />
        </aside>
    );
};

export default RightSidebar;
