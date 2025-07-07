
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Total Expenses — {currentMonthLabel}
              </p>
              <p className="text-sm font-bold text-blue-900 mt-0.5">
                {expenses.length > 0 ? `$${totalSpent.toFixed(2)}` : `No data for ${currentMonthLabel}`}
              </p>
            </div>
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/60">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
          <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                Highest Category — {currentMonthLabel}
              </p>
              {expenses.length > 0 ? (
                <p className="text-sm font-bold text-green-900 mt-0.5 flex items-baseline space-x-2">
                  <span>{highestCategory[0]}</span>
                  <span className="text-xs text-green-600/70">
                    ${Number(highestCategory[1]).toFixed(2)}
                  </span>
                </p>
              ) : (
                <p className="text-sm font-bold text-green-900 mt-0.5">
                  No data for {currentMonthLabel}
                </p>
              )}
            </div>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                Total Transactions — {currentMonthLabel}
              </p>
              <p className="text-sm font-bold text-purple-900 mt-0.5">
                {expenses.length > 0 ? expenses.length : `No data for ${currentMonthLabel}`}
              </p>
            </div>
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
