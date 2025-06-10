
import { Budget } from '@/types/budget';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyMap: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥'
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
         (budget.bills_spent || 0) + 
         (budget.others_spent || 0);
};

export const getTotalAllocated = (budget: Budget): number => {
  return (budget.travel_allocated || 0) + 
         (budget.groceries_allocated || 0) + 
         (budget.bills_allocated || 0) + 
         (budget.others_allocated || 0);
};

export const getBudgetProgress = (budget: Budget): number => {
  const totalSpent = getTotalSpent(budget);
  return (totalSpent / budget.total_amount) * 100;
};
