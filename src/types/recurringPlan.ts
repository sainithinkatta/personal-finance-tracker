/**
 * =====================================================
 * RECURRING PLANS & OCCURRENCES TYPE DEFINITIONS
 * =====================================================
 * 
 * This module defines the types for the refactored recurring system:
 * 
 * - RecurringPlan: A template that repeats (e.g., "Netflix, $15/month")
 * - RecurringOccurrence: Each individual payment instance from a plan
 * 
 * Status Rules:
 * - Plans: 'active' | 'paused' | 'cancelled'
 * - Occurrences: 'upcoming' | 'paid' | 'skipped'
 */

import { ExpenseCategory } from '@/types/expense';

// =====================================================
// PLAN TYPES
// =====================================================

export type PlanStatus = 'active' | 'paused' | 'cancelled';

export interface RecurringPlan {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  currency: string;
  bank_account_id: string | null;
  plan_status: PlanStatus;
  email_reminder: boolean;
  reminder_days_before: number;
  status: string; // Legacy field - kept for compatibility
  last_done_date: string | null;
  last_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringPlanWithComputed extends RecurringPlan {
  /** Computed days until next due date (negative if overdue) */
  daysUntilDue: number;
  /** Whether the plan is overdue (due date has passed) */
  isOverdue: boolean;
}

export interface RecurringPlanFormData {
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  currency: string;
  email_reminder: boolean;
  reminder_days_before: number;
  bank_account_id: string;
}

// =====================================================
// OCCURRENCE TYPES
// =====================================================

export type OccurrenceStatus = 'upcoming' | 'paid' | 'skipped';

export interface RecurringOccurrence {
  id: string;
  plan_id: string;
  user_id: string;
  occurrence_date: string;
  amount: number;
  status: OccurrenceStatus;
  bank_account_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringOccurrenceWithPlan extends RecurringOccurrence {
  plan: RecurringPlan | null;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface RecurringAnalytics {
  /** Total monthly recurring commitment from active plans */
  monthlyCommitment: number;
  /** Total spend this month from paid occurrences */
  thisMonthSpend: number;
  /** Number of active plans */
  activePlansCount: number;
  /** Largest single recurring plan amount */
  largestRecurring: {
    name: string;
    amount: number;
    currency: string;
  } | null;
}

export interface MonthlyRecurringSpend {
  month: string; // YYYY-MM format
  total: number;
  currency: string;
}

export interface CategoryRecurringBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface TopRecurringItem {
  planId: string;
  name: string;
  category: ExpenseCategory;
  bankName: string | null;
  monthlyAmount: number;
  totalSpend: number;
  occurrenceCount: number;
  shareOfTotal: number;
}

// =====================================================
// FILTER TYPES
// =====================================================

export interface RecurringFilters {
  search: string;
  category: ExpenseCategory | 'all';
  bankAccountId: string | 'all';
  planStatus: PlanStatus | 'all';
  dateStart: string;
  dateEnd: string;
}

export const DEFAULT_RECURRING_FILTERS: RecurringFilters = {
  search: '',
  category: 'all',
  bankAccountId: 'all',
  planStatus: 'all',
  dateStart: '',
  dateEnd: '',
};
