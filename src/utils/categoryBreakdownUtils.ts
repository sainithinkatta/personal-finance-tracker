import { Budget } from '@/types/budget';
import { BUDGET_CATEGORIES, BudgetCategoryName, categoryIcons, categoryConfig } from '@/constants/categoryConfig';
import { LucideIcon } from 'lucide-react';

/**
 * Category breakdown data for display
 */
export interface CategoryBreakdownItem {
  name: BudgetCategoryName;
  icon: LucideIcon;
  allocated: number;
  spent: number;
  percent: number;
  isOver: boolean;
  config: typeof categoryConfig[BudgetCategoryName];
}

/**
 * Get category breakdown data from a budget
 * Returns array of categories with spending data, sorted by highest percent used
 *
 * @param budget - The budget object to analyze
 * @returns Array of category breakdown items, sorted and filtered
 */
export const getCategoryBreakdownData = (budget: Budget | null): CategoryBreakdownItem[] => {
  if (!budget) return [];

  const categories: CategoryBreakdownItem[] = [];

  for (const categoryName of BUDGET_CATEGORIES) {
    const allocated = budget[`${categoryName.toLowerCase()}_allocated` as keyof Budget] as number || 0;
    const spent = budget[`${categoryName.toLowerCase()}_spent` as keyof Budget] as number || 0;

    // Skip categories with no allocation
    if (allocated === 0) continue;

    // Calculate percentage (handle division by zero)
    const percent = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    const isOver = percent > 100;

    categories.push({
      name: categoryName,
      icon: categoryIcons[categoryName],
      allocated,
      spent,
      percent,
      isOver,
      config: categoryConfig[categoryName],
    });
  }

  // Sort by highest percent used first, then by highest spent
  categories.sort((a, b) => {
    if (b.percent !== a.percent) {
      return b.percent - a.percent;
    }
    return b.spent - a.spent;
  });

  return categories;
};

/**
 * Get top N categories by percent used
 *
 * @param budget - The budget object to analyze
 * @param limit - Maximum number of categories to return (default 4)
 * @returns Array of top categories
 */
export const getTopCategories = (budget: Budget | null, limit: number = 4): CategoryBreakdownItem[] => {
  const allCategories = getCategoryBreakdownData(budget);
  return allCategories.slice(0, limit);
};

/**
 * Check if there are more categories beyond the limit
 *
 * @param budget - The budget object to analyze
 * @param limit - The display limit (default 4)
 * @returns True if there are more categories than the limit
 */
export const hasMoreCategories = (budget: Budget | null, limit: number = 4): boolean => {
  const allCategories = getCategoryBreakdownData(budget);
  return allCategories.length > limit;
};
