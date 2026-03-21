import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Bell, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { format, differenceInDays, addDays } from 'date-fns';
import { CURRENCIES } from '@/types/expense';
import { parseLocalDate } from '@/utils/dateUtils';

export const MobileReminders: React.FC = () => {
  const { getUpcomingReminders } = useRecurringTransactions();
  const { bankAccounts } = useBankAccounts();
  const [isOpen, setIsOpen] = useState(false);
  
  const upcomingReminders = getUpcomingReminders().filter(tx => tx.status !== 'done');

  const getPaymentInfo = (days: number) => {
    if (days < 0) {
      const n = Math.abs(days);
      return {
        label: `Overdue by ${n} day${n !== 1 ? 's' : ''}!`,
        labelClass: 'text-red-600 font-semibold',
        cardClass: 'bg-red-50 border-red-200',
        Icon: AlertCircle,
        iconClass: 'text-red-500',
      };
    }
    if (days === 0) return {
      label: 'Due Today!',
      labelClass: 'text-orange-600 font-semibold',
      cardClass: 'bg-orange-50 border-orange-200',
      Icon: AlertTriangle,
      iconClass: 'text-orange-500',
    };
    if (days === 1) return {
      label: 'Due Tomorrow',
      labelClass: 'text-amber-600 font-medium',
      cardClass: 'bg-amber-50 border-amber-200',
      Icon: AlertTriangle,
      iconClass: 'text-amber-500',
    };
    if (days <= 3) return {
      label: `In ${days} days`,
      labelClass: 'text-yellow-600',
      cardClass: 'bg-yellow-50 border-yellow-100',
      Icon: Clock,
      iconClass: 'text-yellow-500',
    };
    return {
      label: `In ${days} days`,
      labelClass: 'text-gray-400',
      cardClass: 'bg-gray-50 border-gray-100',
      Icon: Clock,
      iconClass: 'text-gray-400',
    };
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
  };

  const getUpcomingCreditPayments = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return bankAccounts
      .filter(account => account.account_type === 'Credit' && account.payment_due_date)
      .map(account => {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const dueDate = new Date(currentYear, currentMonth, account.payment_due_date!);
        
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

  if (allUpcomingPayments.length === 0) return null;

  return (
    <div className="xl:hidden fixed bottom-20 right-4 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg relative"
          >
            <Bell className="h-6 w-6" />
            {allUpcomingPayments.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
              >
                {allUpcomingPayments.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh]">
          <SheetHeader>
            <SheetTitle>Upcoming Payments</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[50vh]">
            {allUpcomingPayments.map((payment) => {
              const daysUntilDue = differenceInDays(parseLocalDate(payment.next_due_date), new Date());

              const info = getPaymentInfo(daysUntilDue);
              return (
                <div
                  key={payment.id}
                  className={`p-4 border rounded-lg ${info.cardClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {payment.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <info.Icon className={`h-3.5 w-3.5 flex-shrink-0 ${info.iconClass}`} />
                        <span className={`text-sm ${info.labelClass}`}>{info.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Due: {format(parseLocalDate(payment.next_due_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm font-semibold text-destructive mt-1">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};