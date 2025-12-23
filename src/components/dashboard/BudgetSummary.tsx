import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBudgets } from '@/hooks/useBudgets';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTopCategories, hasMoreCategories, CategoryBreakdownItem } from '@/utils/categoryBreakdownUtils';

interface BudgetSummaryProps {
  expenses: Expense[];
  currency: string;
}

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

/**
 * Compact category row component for dashboard
 */
const CategoryRow: React.FC<{ category: CategoryBreakdownItem; currency: string }> = ({ category, currency }) => {
  const symbol = getCurrencySymbol(currency);
  const Icon = category.icon;

  return (
    <div className="group py-2 px-2 -mx-2 rounded-md hover:bg-muted/30 transition-colors">
      {/* Top row: Icon + Name | Amount + Percent Badge */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        {/* Left: Icon + Category Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`p-1 rounded-md flex-shrink-0 ${category.config.bg}`}>
            <Icon className={`h-3.5 w-3.5 ${category.config.color}`} />
          </div>
          <span className="text-xs font-medium text-foreground truncate">
            {category.name}
          </span>
        </div>

        {/* Right: Amount + Percent Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold tabular-nums ${category.isOver ? 'text-red-600' : 'text-foreground'}`}>
            {symbol}{category.spent.toFixed(2)}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 h-5 min-w-[52px] justify-center rounded-full font-semibold ${
              category.isOver
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-green-100 text-green-700 border-green-300'
            }`}
          >
            {category.percent}%{category.isOver && ' Over'}
          </Badge>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            category.isOver ? 'bg-red-500' : category.config.progress
          }`}
          style={{ width: `${Math.min(category.percent, 100)}%` }}
        />
      </div>
    </div>
  );
};

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ expenses, currency }) => {
  const { budgets } = useBudgets();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Find budget for current month and currency
  const currentBudget = useMemo(() => {
    return budgets.find(
      budget =>
        budget.month === currentMonth &&
        budget.year === currentYear &&
        budget.currency === currency
    );
  }, [budgets, currentMonth, currentYear, currency]);

  // Calculate total spent from current month expenses
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const symbol = getCurrencySymbol(currency);

  // Get top 4 categories by percent used
  const topCategories = useMemo(
    () => getTopCategories(currentBudget, 4),
    [currentBudget]
  );

  // Check if there are more than 4 categories
  const showViewAll = useMemo(
    () => hasMoreCategories(currentBudget, 4),
    [currentBudget]
  );

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
              Create a budget for {format(new Date(), 'MMMM yyyy')}
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
      {/* Header */}
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="truncate">{format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 flex-shrink-0 ${status.color} border`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 flex-1 flex flex-col gap-3">
        {/* Summary Metrics - 2-column grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{symbol}{totalSpent.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</span>
            <span className={`text-sm font-bold tabular-nums ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {symbol}{Math.abs(remaining).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Used</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{usedPercentage}%</span>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="py-1">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usedPercentage > 100
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : usedPercentage > 80
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget & Allocated - Divider */}
        <div className="pt-1 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Budget</span>
            <span className="text-sm font-semibold text-blue-600 tabular-nums">{symbol}{budgetTotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Allocated</span>
            <span className="text-sm font-semibold text-purple-600 tabular-nums">{symbol}{totalAllocated.toFixed(2)}</span>
          </div>
        </div>

        {/* Category Breakdown - Divider */}
        <div className="pt-2 border-t border-border/50 flex-1 flex flex-col">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Category Breakdown
            </span>
          </div>

          {topCategories.length === 0 ? (
            // Empty state - no category budgets
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-4 px-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1.5">No category budgets yet</p>
                <Link
                  to="/budgets"
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  Add categories →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Category list (max 4) */}
              <div className="space-y-0.5 flex-1">
                {topCategories.map((category) => (
                  <CategoryRow key={category.name} category={category} currency={currency} />
                ))}
              </div>

              {/* View all link footer - separated with border */}
              {showViewAll && (
                <div className="pt-3 mt-2 border-t border-border/40">
                  <Link
                    to="/budgets"
                    className="block text-xs text-primary hover:text-primary/80 font-medium text-center py-1.5 hover:bg-muted/30 rounded-md transition-colors"
                  >
                    View all categories →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
