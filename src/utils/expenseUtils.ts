
import { startOfDay, endOfDay, format } from 'date-fns';
import { Expense, FilterOptions, ExpenseSummary, CategorySummary, GroupByPeriod, ExpenseCategory, GroupedExpense } from '@/types/expense';
import { Transaction } from '@/types/transaction';

export const filterExpenses = (expenses: Expense[], filters: FilterOptions): Expense[] => {
  return expenses.filter(expense => {
    // Date filter
    if (filters.startDate && expense.date < startOfDay(filters.startDate)) {
      return false;
    }
    if (filters.endDate && expense.date > endOfDay(filters.endDate)) {
      return false;
    }
    
    // Category filter - Income filter doesn't apply to expenses
    if (filters.category !== 'All' && filters.category !== 'Income' && expense.category !== filters.category) {
      return false;
    }
    
    // If Income filter is selected, no expenses should match
    if (filters.category === 'Income') {
      return false;
    }
    
    return true;
  });
};

export const filterTransactions = (transactions: Transaction[], filters: FilterOptions): Transaction[] => {
  return transactions.filter(tx => {
    // Date filter
    if (filters.startDate && tx.date < startOfDay(filters.startDate)) {
      return false;
    }
    if (filters.endDate && tx.date > endOfDay(filters.endDate)) {
      return false;
    }
    
    // Category filter
    if (filters.category !== 'All' && tx.category !== filters.category) {
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