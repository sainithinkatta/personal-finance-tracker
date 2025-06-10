
import { ExpenseCategory } from '@/types/expense';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  currency: string;
  email_reminder: boolean;
  reminder_days_before: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransactionFormData {
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  currency: string;
  email_reminder: boolean;
  reminder_days_before: number;
}

export interface EditRecurringTransactionData {
  id: string;
  data: Partial<RecurringTransactionFormData>;
}
