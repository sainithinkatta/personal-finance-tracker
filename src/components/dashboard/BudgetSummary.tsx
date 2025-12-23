import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBudgets } from '@/hooks/useBudgets';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTopCategories, CategoryBreakdownItem } from '@/utils/categoryBreakdownUtils';
import { getBudgetSummary } from '@/utils/budgetUtils';

interface BudgetSummaryProps {
  expenses: Expense[];
  currency: string;
}

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

/**
 * Ultra-compact category row without progress bar
 */
const CategoryRow: React.FC<{ category: CategoryBreakdownItem; currency: string }> = ({ category, currency }) => {
  const symbol = getCurrencySymbol(currency);
  const Icon = category.icon;
  const percentLabel = category.isOver ? `${category.percent}% Over` : `${category.percent}%`;

  return (
    <div className="flex items-center justify-between gap-2 py-1 px-2 rounded hover:bg-muted/30 transition-colors">
      {/* Left: Icon + Name */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className={`p-0.5 rounded flex-shrink-0 ${category.config.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${category.config.color}`} />
        </div>
        <span className="text-sm font-medium text-foreground truncate">
          {category.name}
        </span>
      </div>

      {/* Right: Amount + Badge */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-sm font-semibold tabular-nums ${category.isOver ? 'text-red-600' : 'text-foreground'}`}>
          {symbol}{category.spent.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ expenses: _expenses, currency }) => {
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

  // Get unified budget summary (SOURCE OF TRUTH)
  const summary = useMemo(() => {
    if (!currentBudget) return null;
    return getBudgetSummary(currentBudget);
  }, [currentBudget]);

  const symbol = getCurrencySymbol(currency);

  // Get all categories (limit to 5 as per requirements)
  const topCategories = useMemo(
    () => getTopCategories(currentBudget, 5),
    [currentBudget]
  );

  // If no budget exists, show empty state
  if (!currentBudget || !summary) {
    return (
      <Card className="bg-card border border-border/60 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-2 px-4 pt-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 flex items-center justify-center">
          <div className="text-center py-6">
            <div className="w-10 h-10 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No budget set</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a budget for {format(new Date(), 'MMMM yyyy')} in the Budgets tab
            </p>
            <Link
              to="/budgets"
              className="mt-3 inline-block text-xs text-primary hover:underline font-medium"
            >
              Go to Budgets →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border/60 shadow-sm h-full flex flex-col">
      {/* Header - Compact */}
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="truncate">{format(new Date(currentYear, currentMonth - 1), 'MMM yyyy')}</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 flex-shrink-0 ${summary.statusColors.badge} border`}
          >
            {summary.statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0 flex flex-col gap-2">
        {/* Metrics in 2x2 grid - More compact */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Spent</div>
            <div className="text-base font-semibold text-foreground tabular-nums">{symbol}{summary.spent.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</div>
            <div className={`text-base font-semibold tabular-nums ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {symbol}{Math.abs(summary.remaining).toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Budget</div>
            <div className="text-base font-semibold text-blue-600 tabular-nums">{symbol}{summary.budget.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Used</div>
            <div className="text-base font-semibold text-foreground tabular-nums">{summary.usedPercentage}%</div>
          </div>
        </div>

        {/* Progress Bar - Slimmer with unified color logic */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${summary.statusColors.bar}`}
            style={{ width: `${Math.min(summary.usedPercentage, 100)}%` }}
          />
        </div>

        {/* Allocated - Single line with smaller font */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Allocated</span>
          <span className="text-sm font-semibold text-purple-600 tabular-nums">{symbol}{summary.allocated.toFixed(0)}</span>
        </div>

        {/* Category Breakdown - Compact with smaller heading */}
        <div className="pt-1 border-t border-border/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-semibold">
              All Categories
            </span>
          </div>

          <div className="space-y-0.5">
              {topCategories.map((category) => (
                <CategoryRow key={category.name} category={category} currency={currency} />
              ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
