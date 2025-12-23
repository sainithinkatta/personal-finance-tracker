
import { Budget } from '@/types/budget';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyMap: { [key: string]: string } = {
    USD: '$'
  };

  const symbol = currencyMap[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCategoryRemaining = (budget: Budget, category: string): number => {
  const allocated = budget[`${category.toLowerCase()}_allocated` as keyof Budget] as number || 0;
  const spent = budget[`${category.toLowerCase()}_spent` as keyof Budget] as number || 0;
  return allocated - spent;
};

export const getTotalSpent = (budget: Budget): number => {
  return (budget.travel_spent || 0) +
         (budget.groceries_spent || 0) +
         (budget.food_spent || 0) +
         (budget.bills_spent || 0) +
         (budget.others_spent || 0);
};

export const getTotalAllocated = (budget: Budget): number => {
  return (budget.travel_allocated || 0) +
         (budget.groceries_allocated || 0) +
         (budget.food_allocated || 0) +
         (budget.bills_allocated || 0) +
         (budget.others_allocated || 0);
};

export const getBudgetProgress = (budget: Budget): number => {
  const totalSpent = getTotalSpent(budget);
  return (totalSpent / budget.total_amount) * 100;
};

/**
 * Budget status types
 */
export type BudgetStatus = 'on_track' | 'warning' | 'over_budget';

/**
 * Get budget status based on usage percentage
 * Thresholds: <80% = on track, 80-100% = warning, >100% = over budget
 */
export const getBudgetStatus = (usedPercentage: number): BudgetStatus => {
  if (usedPercentage >= 100) return 'over_budget';
  if (usedPercentage >= 80) return 'warning';
  return 'on_track';
};

/**
 * Get status label for display
 */
export const getBudgetStatusLabel = (status: BudgetStatus): string => {
  switch (status) {
    case 'on_track': return 'On Track';
    case 'warning': return 'Warning';
    case 'over_budget': return 'Over Budget';
  }
};

/**
 * Get status color classes for badges
 */
export const getBudgetStatusColors = (status: BudgetStatus) => {
  switch (status) {
    case 'on_track':
      return {
        badge: 'bg-green-100 text-green-700 border-green-200',
        bar: 'bg-gradient-to-r from-green-500 to-green-600'
      };
    case 'warning':
      return {
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        bar: 'bg-gradient-to-r from-amber-500 to-amber-600'
      };
    case 'over_budget':
      return {
        badge: 'bg-red-100 text-red-700 border-red-200',
        bar: 'bg-gradient-to-r from-red-500 to-red-600'
      };
  }
};

/**
 * Unified budget summary data
 * This ensures both Budget tab and Dashboard use identical calculations
 */
export interface BudgetSummaryData {
  budget: number;
  allocated: number;
  spent: number;
  remaining: number;
  usedPercentage: number;
  status: BudgetStatus;
  statusLabel: string;
  statusColors: ReturnType<typeof getBudgetStatusColors>;
}

/**
 * Get complete budget summary data
 * SOURCE OF TRUTH for all budget calculations
 */
export const getBudgetSummary = (budget: Budget): BudgetSummaryData => {
  const budgetTotal = budget.total_amount;
  const allocated = getTotalAllocated(budget);
  const spent = getTotalSpent(budget);
  const remaining = budgetTotal - spent;
  const usedPercentage = budgetTotal > 0 ? getBudgetProgress(budget) : 0;
  const status = getBudgetStatus(usedPercentage);

  return {
    budget: budgetTotal,
    allocated,
    spent,
    remaining,
    usedPercentage: Math.round(usedPercentage),
    status,
    statusLabel: getBudgetStatusLabel(status),
    statusColors: getBudgetStatusColors(status)
  };
};
