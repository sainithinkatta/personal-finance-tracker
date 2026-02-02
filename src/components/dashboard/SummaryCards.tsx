import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Expense } from '@/types/expense';
import { DollarSign, TrendingUp, Receipt, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  expenses: Expense[];
  currentMonthLabel: string;
  currency: string;
}

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, currentMonthLabel, currency }) => {
  // Filter out income transactions and negative amounts (defensive filtering)
  // This ensures we only show expenses, not net balance (expenses - income)
  const validExpenses = expenses.filter(
    expense => (expense as any).category !== 'Income' && expense.amount > 0
  );

  const totalSpent = validExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const symbol = getCurrencySymbol(currency);

  const categoryTotals = validExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const highestCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  // Calculate average transaction
  const avgTransaction = validExpenses.length > 0 ? totalSpent / validExpenses.length : 0;

  const cards = [
    {
      title: 'Total Expenses',
      value: validExpenses.length > 0 ? `${symbol}${totalSpent.toFixed(2)}` : 'No data',
      subtitle: currentMonthLabel,
      icon: DollarSign,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Highest Category',
      value: validExpenses.length > 0 ? highestCategory[0] : 'No data',
      subtitle: validExpenses.length > 0 ? `${symbol}${Number(highestCategory[1]).toFixed(2)}` : '',
      icon: TrendingUp,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      title: 'Transactions',
      value: validExpenses.length > 0 ? validExpenses.length.toString() : 'No data',
      subtitle: currentMonthLabel,
      icon: Receipt,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    {
      title: 'Avg Transaction',
      value: validExpenses.length > 0 ? `${symbol}${avgTransaction.toFixed(2)}` : 'No data',
      subtitle: 'Per expense',
      icon: ArrowUpRight,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className="bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                    {card.title}
                  </p>
                  <p className="text-lg lg:text-xl font-bold text-foreground mt-1 truncate">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  card.iconBg
                )}>
                  <Icon className={cn("h-5 w-5", card.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;
