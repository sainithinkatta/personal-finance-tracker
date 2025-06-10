
import { startOfDay, endOfDay, isWithinInterval, format } from 'date-fns';
import { Expense, FilterOptions, ExpenseSummary, CategorySummary, GroupByPeriod, ExpenseCategory, GroupedExpense } from '@/types/expense';

export const filterExpenses = (expenses: Expense[], filters: FilterOptions): Expense[] => {
  return expenses.filter(expense => {
    // Date filter
    if (filters.startDate && expense.date < startOfDay(filters.startDate)) {
      return false;
    }
    if (filters.endDate && expense.date > endOfDay(filters.endDate)) {
      return false;
    }
    
    // Category filter
    if (filters.category !== 'All' && expense.category !== filters.category) {
      return false;
    }
    
    return true;
  });
};

export const groupExpensesByPeriod = (expenses: Expense[], period: GroupByPeriod): GroupedExpense[] => {
  const grouped = expenses.reduce((acc, expense) => {
    let key: string;
    
    switch (period) {
      case 'day':
        key = format(expense.date, 'yyyy-MM-dd');
        break;
      case 'month':
        key = format(expense.date, 'yyyy-MM');
        break;
      case 'year':
        key = format(expense.date, 'yyyy');
        break;
      default:
        key = format(expense.date, 'yyyy-MM-dd');
    }
    
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([period, total]) => ({ period, total }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

export const calculateCategorySummary = (expenses: Expense[]): CategorySummary[] => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  
  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as ExpenseCategory,
    total: amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  }));
};