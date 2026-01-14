import React from 'react';
import { CreditCard as CreditCardIcon, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BankAccount } from '@/types/bankAccount';

interface CreditCardTabsProps {
  creditAccounts: BankAccount[];
  selectedCardId: string | 'all';
  onSelectCard: (cardId: string | 'all') => void;
  currency: string;
}

const CreditCardTabs: React.FC<CreditCardTabsProps> = ({
  creditAccounts,
  selectedCardId,
  onSelectCard,
  currency,
}) => {
  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };
    return symbols[curr] || curr;
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${getCurrencySymbol(currency)}${(amount / 1000).toFixed(1)}k`;
    }
    return `${getCurrencySymbol(currency)}${amount.toFixed(0)}`;
  };

  const getCardBalance = (account: BankAccount) => {
    return account.due_balance ?? 
      (account.credit_limit && account.available_balance != null 
        ? account.credit_limit - account.available_balance 
        : account.balance || 0);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full">
      {/* Scrollable tabs container */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex gap-2 pb-2 min-w-max">
          {/* All Cards Tab */}
          <button
            onClick={() => onSelectCard('all')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl transition-all shrink-0",
              "border-2 min-w-[120px]",
              selectedCardId === 'all'
                ? "bg-primary text-primary-foreground border-primary shadow-lg"
                : "bg-card hover:bg-accent border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              selectedCardId === 'all' 
                ? "bg-primary-foreground/20" 
                : "bg-primary/10"
            )}>
              <Wallet className={cn(
                "h-4 w-4",
                selectedCardId === 'all' ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "text-sm font-semibold leading-tight",
                selectedCardId === 'all' ? "text-primary-foreground" : "text-foreground"
              )}>
                All Cards
              </p>
              <p className={cn(
                "text-xs",
                selectedCardId === 'all' ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {creditAccounts.length} cards
              </p>
            </div>
          </button>

          {/* Individual Card Tabs */}
          {creditAccounts.map((account) => {
            const isSelected = selectedCardId === account.id;
            const balance = getCardBalance(account);
            const initials = getInitials(account.name || 'CC');
            
            return (
              <button
                key={account.id}
                onClick={() => onSelectCard(account.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl transition-all shrink-0",
                  "border-2 min-w-[140px]",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card hover:bg-accent border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                  isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-primary/10 text-primary"
                )}>
                  {initials}
                </div>
                <div className="text-left min-w-0">
                  <p className={cn(
                    "text-sm font-semibold leading-tight truncate max-w-[100px]",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {account.name || 'Unnamed Card'}
                  </p>
                  <p className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary-foreground/70" : "text-destructive"
                  )}>
                    {formatCompactCurrency(balance)}
                  </p>
                </div>
                {account.payment_due_date && (
                  <div className={cn(
                    "ml-auto text-xs px-1.5 py-0.5 rounded shrink-0",
                    isSelected 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {account.payment_due_date}th
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreditCardTabs;
