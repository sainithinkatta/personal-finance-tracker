
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Expense } from '@/types/expense';

interface SummaryCardsProps {
  expenses: Expense[];
  currentMonthLabel: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, currentMonthLabel }) => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const highestCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      <Card className="bg-gradient-to-br from-info-muted to-info-muted/50 border-info/20 hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-info-foreground uppercase tracking-wide truncate">
                Total Expenses — {currentMonthLabel}
              </p>
              <p className="text-base sm:text-lg font-bold text-info-foreground mt-1 truncate">
                {expenses.length > 0 ? `$${totalSpent.toFixed(2)}` : `No data`}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-info rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent-muted to-accent-muted/50 border-accent/20 hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-accent-foreground uppercase tracking-wide truncate">
                Highest Category — {currentMonthLabel}
              </p>
              {expenses.length > 0 ? (
                <p className="text-base sm:text-lg font-bold text-accent-foreground mt-1 flex items-baseline gap-2 min-w-0">
                  <span className="truncate">{highestCategory[0]}</span>
                  <span className="text-xs sm:text-sm text-accent-foreground/70 flex-shrink-0">
                    ${Number(highestCategory[1]).toFixed(2)}
                  </span>
                </p>
              ) : (
                <p className="text-base sm:text-lg font-bold text-accent-foreground mt-1 truncate">
                  No data
                </p>
              )}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-warning-muted to-warning-muted/50 border-warning/20 hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-warning-foreground uppercase tracking-wide truncate">
                Total Transactions — {currentMonthLabel}
              </p>
              <p className="text-base sm:text-lg font-bold text-warning-foreground mt-1 truncate">
                {expenses.length > 0 ? expenses.length : `No data`}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-warning-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
