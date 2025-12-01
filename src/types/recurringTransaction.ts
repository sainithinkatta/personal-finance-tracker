
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
  status: 'pending' | 'done';
  last_done_date: string | null;
  last_reminder_sent_at: string | null;
  bank_account_id: string | null;
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
