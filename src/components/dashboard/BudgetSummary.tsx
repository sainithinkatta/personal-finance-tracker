import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBudgets } from '@/hooks/useBudgets';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface BudgetSummaryProps {
  expenses: Expense[];
  currency: string;
  selectedMonth?: number;
  selectedYear?: number;
}

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  expenses,
  currency,
  selectedMonth,
  selectedYear
}) => {
  const { budgets } = useBudgets();

  // Use selected month/year or fallback to current date
  const currentDate = new Date();
  const month = (selectedMonth ?? currentDate.getMonth()) + 1; // Convert to 1-12 range
  const year = selectedYear ?? currentDate.getFullYear();

  // Find budget for selected month and currency
  const currentBudget = useMemo(() => {
    return budgets.find(
      budget =>
        budget.month === month &&
        budget.year === year &&
        budget.currency === currency
    );
  }, [budgets, month, year, currency]);

  // Calculate total spent from current month expenses
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const symbol = getCurrencySymbol(currency);

  // If no budget exists, show empty state
  if (!currentBudget) {
    return (
      <Card className="bg-card border border-border/60 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No budget set</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a budget for {format(new Date(year, month - 1), 'MMMM yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const budgetTotal = currentBudget.total_amount;
  const remaining = budgetTotal - totalSpent;
  const usedPercentage = Math.round((totalSpent / budgetTotal) * 100);

  // Calculate total allocated
  const totalAllocated = (
    (currentBudget.travel_allocated || 0) +
    (currentBudget.groceries_allocated || 0) +
    (currentBudget.food_allocated || 0) +
    (currentBudget.bills_allocated || 0) +
    (currentBudget.others_allocated || 0)
  );

  // Determine budget status
  const getStatus = () => {
    if (usedPercentage < 70) return { label: 'On Track', color: 'bg-green-100 text-green-700 border-green-200' };
    if (usedPercentage < 90) return { label: 'Warning', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Over Budget', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  const status = getStatus();

  return (
    <Card className="bg-card border border-border/60 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            {format(new Date(year, month - 1), 'MMMM yyyy')}
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 ${status.color} border`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</span>
            <span className="text-base font-bold text-foreground">{symbol}{totalSpent.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</span>
            <span className={`text-base font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {symbol}{Math.abs(remaining).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Used</span>
            <span className="text-base font-bold text-foreground">{usedPercentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Budget</span>
            <span className="text-sm font-semibold text-blue-600">{symbol}{budgetTotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Allocated</span>
            <span className="text-sm font-semibold text-purple-600">{symbol}{totalAllocated.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
