
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { format, differenceInDays, addDays } from 'date-fns';
import { CURRENCIES } from '@/types/expense';

const UtilityPanel: React.FC = () => {
  const navigate = useNavigate();
  const { getUpcomingReminders } = useRecurringTransactions();
  const { bankAccounts } = useBankAccounts();
  const upcomingReminders = getUpcomingReminders();

  const handleAddBudget = () => {
    navigate('/?tab=budget');
  };

  const handleAddGoal = () => {
    navigate('/?tab=savings');
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
        };
      })
      .filter(payment => {
        const dueDate = new Date(payment.next_due_date);
        return dueDate <= nextWeek && payment.amount > 0;
      });
  };

  const upcomingCreditPayments = getUpcomingCreditPayments();
  const allUpcomingPayments = [...upcomingReminders, ...upcomingCreditPayments];

  return (
    <aside className="hidden xl:flex flex-col w-64 p-4 space-y-6">
      {/* Upcoming Payments & Reminders */}
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs">Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {allUpcomingPayments.length > 0 ? (
            <div className="space-y-2">
              {allUpcomingPayments.map((payment) => {
                const daysUntilDue = differenceInDays(new Date(payment.next_due_date), new Date());
                return (
                  <div
                    key={payment.id}
                    className="p-2 border rounded-md bg-yellow-50/50"
                  >
                    <h4 className="text-xs font-medium text-gray-900">{payment.name}</h4>
                    <p className="text-xs text-gray-600">
                      Due: {format(new Date(payment.next_due_date), 'MMM d, yyyy')}
                      {daysUntilDue === 0 && ' (Today)'}
                      {daysUntilDue === 1 && ' (Tomorrow)'}
                      {daysUntilDue > 1 && ` (${daysUntilDue} days)`}
                    </p>
                    <p className="text-xs font-semibold text-red-600">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Bell className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-xs">No payments due in the next 7 days</p>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};

export default UtilityPanel;