
export type ExpenseCategory = 'Groceries' | 'Food' | 'Travel' | 'Bills' | 'Others';
export type GroupByPeriod = 'day' | 'month' | 'year';

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  currency: string;
  bank_account_id?: string;
  budget_id?: string;
}

export interface FilterOptions {
  startDate: Date | null;
  endDate: Date | null;
  category: ExpenseCategory | 'All';
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalTransactions: number;
  highestCategory: {
    category: ExpenseCategory;
    amount: number;
  } | null;
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  percentage: number;
}

export interface GroupedExpense {
  period: string;
  total: number;
}

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

// Bank-wise category breakdown types
export interface BankBreakdown {
  bank_account_id: string;
  bank_name: string;
  account_type: string;
  total_spent: number;
  percentage: number; // Percentage of this category's total
}

export interface CategoryBankBreakdown {
  category: ExpenseCategory;
  total: number;
  banks: BankBreakdown[];
}
