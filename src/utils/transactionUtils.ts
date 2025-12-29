import { startOfDay, endOfDay } from 'date-fns';
import { Transaction } from '@/types/transaction';
import { ExpenseCategory } from '@/types/expense';

export interface TransactionFilterOptions {
  startDate: Date | null;
  endDate: Date | null;
  category: ExpenseCategory | 'Income' | 'All';
}

export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilterOptions
): Transaction[] => {
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
