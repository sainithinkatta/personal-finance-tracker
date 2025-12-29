import { ExpenseCategory } from './expense';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  amount: number; // Positive for expenses, negative for income (credit)
  category: ExpenseCategory | 'Income';
  description?: string;
  currency: string;
  bank_account_id?: string;
  budget_id?: string;
  // Original source ID for operations
  sourceId: string;
}
