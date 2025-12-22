import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const UtilityPanel: React.FC = () => {
  const navigate = useNavigate();
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
        };
      })
      .filter(payment => {
        const dueDate = parseLocalDate(payment.next_due_date);
        return dueDate <= nextWeek && payment.amount > 0;
      });
  };

  const upcomingCreditPayments = getUpcomingCreditPayments();
  const allUpcomingPayments = [...upcomingReminders, ...upcomingCreditPayments];

  return (
    <aside className="hidden xl:flex flex-col w-64 p-4 space-y-6">
      {/* Add Expense Button */}
      <Button
        onClick={() => setIsAddExpenseOpen(true)}
        variant="default"
        className="w-full h-11 text-sm font-medium shadow-lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Expense
      </Button>

      {/* Add Income Button */}
      <Button
        onClick={() => setIsAddIncomeOpen(true)}
        variant="outline"
        className="w-full h-11 text-sm font-medium"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        Add Income
      </Button>

      {/* Upcoming Payments & Reminders */}
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs">Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {allUpcomingPayments.length > 0 ? (
            <div className="space-y-2">
              {allUpcomingPayments.map((payment) => {
                const daysUntilDue = differenceInDays(parseLocalDate(payment.next_due_date), new Date());

                return (
                  <div
                    key={payment.id}
                    className="p-2 border rounded-md bg-warning-muted border-warning/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-foreground truncate">
                          {payment.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(parseLocalDate(payment.next_due_date), 'MMM d, yyyy')}
                          {daysUntilDue === 0 && ' (Today)'}
                          {daysUntilDue === 1 && ' (Tomorrow)'}
                          {daysUntilDue > 1 && ` (${daysUntilDue} days)`}
                        </p>
                        <p className="text-xs font-semibold text-destructive">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Bell className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs">No payments due in the next 7 days</p>
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

export default UtilityPanel;