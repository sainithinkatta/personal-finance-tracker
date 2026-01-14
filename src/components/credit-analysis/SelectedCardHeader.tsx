import React from 'react';
import { CreditCard as CreditCardIcon, Edit2, Calendar, Percent, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BankAccount } from '@/types/bankAccount';
import { CreditCard } from '@/types/creditAnalysis';
import { CURRENCIES } from '@/types/expense';

interface SelectedCardHeaderProps {
  account: BankAccount;
  creditCard: CreditCard;
  currency: string;
}

const SelectedCardHeader: React.FC<SelectedCardHeaderProps> = ({
  account,
  creditCard,
  currency,
}) => {
  const getCurrencySymbol = (curr: string) => {
    const found = CURRENCIES.find(c => c.code === curr);
    return found?.symbol || curr;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Derived values
  const creditLimit = account.credit_limit || 0;
  const outstanding = creditCard.balance;
  const availableBalance = account.available_balance ?? (creditLimit - outstanding);
  const dueDate = account.payment_due_date;
  const apr = creditCard.apr;
  const minimumPayment = creditCard.minimumPayment;

  // Utilization calculation
  const utilizationPercent = creditLimit > 0 
    ? Math.min((outstanding / creditLimit) * 100, 100) 
    : 0;
  
  const utilizationColor = utilizationPercent > 80 
    ? 'text-destructive' 
    : utilizationPercent > 50 
      ? 'text-yellow-600 dark:text-yellow-500' 
      : 'text-green-600 dark:text-green-500';

  // Missing data flags
  const hasMissingApr = !creditCard.aprProvided;
  const hasMissingMinPayment = !creditCard.minimumPaymentProvided;

  const handleEdit = () => {
    const event = new CustomEvent('edit-bank-account', { detail: { id: account.id } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-4">
      {/* Card Title Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCardIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold truncate">{account.name || 'Credit Card'}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {dueDate && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {dueDate}th
                </Badge>
              )}
              <Badge variant="outline" className="text-xs gap-1">
                <Percent className="h-3 w-3" />
                {apr}% APR
              </Badge>
              {hasMissingApr && (
                <Badge variant="destructive" className="text-xs">Missing APR</Badge>
              )}
              {hasMissingMinPayment && (
                <Badge variant="destructive" className="text-xs">Missing Min Payment</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit} className="shrink-0 gap-1">
          <Edit2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      </div>

      {/* Stats Grid - Similar to reference UI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Credit Limit */}
        {creditLimit > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Credit Limit</p>
            <p className="text-base sm:text-lg font-semibold">{formatCurrency(creditLimit)}</p>
          </div>
        )}

        {/* Outstanding */}
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
          <p className="text-base sm:text-lg font-semibold text-destructive">{formatCurrency(outstanding)}</p>
        </div>

        {/* Available to Spend */}
        {creditLimit > 0 && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-500">
              {formatCurrency(Math.max(0, availableBalance))}
            </p>
          </div>
        )}

        {/* Minimum Payment */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Min Payment</p>
          <p className="text-base sm:text-lg font-semibold">{formatCurrency(minimumPayment)}</p>
          <p className="text-xs text-muted-foreground">/month</p>
        </div>

        {/* APR */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">APR</p>
          <p className="text-base sm:text-lg font-semibold">{apr}%</p>
          <p className="text-xs text-muted-foreground">annual</p>
        </div>
      </div>

      {/* Utilization Bar */}
      {creditLimit > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Credit Utilization</span>
            <span className={`font-medium ${utilizationColor}`}>
              {utilizationPercent.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={utilizationPercent} 
            className="h-2"
          />
          {utilizationPercent > 30 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {utilizationPercent > 80 
                ? 'High utilization may affect credit score' 
                : utilizationPercent > 50 
                  ? 'Consider keeping utilization below 30%' 
                  : 'Moderate utilization'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedCardHeader;
