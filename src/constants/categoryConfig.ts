import { Plane, ShoppingCart, Zap, Coffee, Package, LucideIcon } from 'lucide-react';

/**
 * Budget category icons
 */
export const categoryIcons: Record<string, LucideIcon> = {
  Travel: Plane,
  Groceries: ShoppingCart,
  Bills: Zap,
  Food: Coffee,
  Others: Package,
};

/**
 * Budget category color and styling configuration
 */
export const categoryConfig = {
  Travel: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    progress: 'bg-blue-500',
    light: 'bg-blue-100'
  },
  Groceries: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    progress: 'bg-emerald-500',
    light: 'bg-emerald-100'
  },
  Bills: {
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    progress: 'bg-amber-500',
    light: 'bg-amber-100'
  },
  Food: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    progress: 'bg-red-500',
    light: 'bg-red-100'
  },
  Others: {
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    progress: 'bg-purple-500',
    light: 'bg-purple-100'
  },
} as const;

/**
 * Valid budget category names
 */
export type BudgetCategoryName = keyof typeof categoryIcons;

/**
 * Array of all budget category names
 */
export const BUDGET_CATEGORIES: BudgetCategoryName[] = [
  'Travel',
  'Groceries',
  'Bills',
  'Food',
  'Others',
];
