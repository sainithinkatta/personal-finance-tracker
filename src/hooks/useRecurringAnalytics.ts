/**
 * =====================================================
 * RECURRING ANALYTICS HOOK
 * =====================================================
 * 
 * Aggregates data from plans and occurrences for the Analysis tab.
 * Provides insights on recurring spend patterns.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  RecurringAnalytics,
  MonthlyRecurringSpend,
  CategoryRecurringBreakdown,
  TopRecurringItem,
} from '@/types/recurringPlan';
import { ExpenseCategory } from '@/types/expense';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// =====================================================
// MAIN HOOK
// =====================================================

export function useRecurringAnalytics() {
  // Summary analytics
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: ['recurring-analytics', 'summary'],
    queryFn: async (): Promise<RecurringAnalytics> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch active plans
      const { data: plans } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_status', 'active');

      // Calculate monthly commitment (normalize yearly to monthly)
      let monthlyCommitment = 0;
      let largestRecurring: RecurringAnalytics['largestRecurring'] = null;

      (plans || []).forEach(plan => {
        const amount = plan.amount || 0;
        let monthlyAmount = amount;
        
        if (plan.frequency === 'yearly') {
          monthlyAmount = amount / 12;
        } else if (plan.frequency === 'weekly') {
          monthlyAmount = amount * 4.33; // Average weeks per month
        } else if (plan.frequency === 'daily') {
          monthlyAmount = amount * 30;
        }
        
        monthlyCommitment += monthlyAmount;
        
        if (!largestRecurring || amount > largestRecurring.amount) {
          largestRecurring = {
            name: plan.name || 'Unnamed',
            amount,
            currency: plan.currency,
          };
        }
      });

      // Fetch this month's paid occurrences
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      const { data: thisMonthOccurrences } = await supabase
        .from('recurring_occurrences')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('occurrence_date', monthStart)
        .lte('occurrence_date', monthEnd);

      const thisMonthSpend = (thisMonthOccurrences || []).reduce(
        (sum, occ) => sum + (occ.amount || 0), 
        0
      );

      return {
        monthlyCommitment,
        thisMonthSpend,
        activePlansCount: plans?.length || 0,
        largestRecurring,
      };
    },
  });

  // Monthly spend trend (last 6 months)
  const {
    data: monthlyTrend = [],
    isLoading: isLoadingTrend,
  } = useQuery({
    queryKey: ['recurring-analytics', 'monthly-trend'],
    queryFn: async (): Promise<MonthlyRecurringSpend[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const sixMonthsAgo = subMonths(now, 6);

      const { data: occurrences } = await supabase
        .from('recurring_occurrences')
        .select('occurrence_date, amount')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('occurrence_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
        .order('occurrence_date', { ascending: true });

      // Group by month
      const monthlyMap = new Map<string, number>();
      
      (occurrences || []).forEach(occ => {
        const month = format(new Date(occ.occurrence_date), 'yyyy-MM');
        const current = monthlyMap.get(month) || 0;
        monthlyMap.set(month, current + (occ.amount || 0));
      });

      // Generate array for last 6 months
      const result: MonthlyRecurringSpend[] = [];
      for (let i = 5; i >= 0; i--) {
        const month = format(subMonths(now, i), 'yyyy-MM');
        result.push({
          month,
          total: monthlyMap.get(month) || 0,
          currency: 'USD', // Default, could be enhanced
        });
      }

      return result;
    },
  });

  // Category breakdown
  const {
    data: categoryBreakdown = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['recurring-analytics', 'category-breakdown'],
    queryFn: async (): Promise<CategoryRecurringBreakdown[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get active plans with their categories
      const { data: plans } = await supabase
        .from('recurring_transactions')
        .select('category, amount, frequency')
        .eq('user_id', user.id)
        .eq('plan_status', 'active');

      if (!plans || plans.length === 0) return [];

      // Aggregate by category (normalize to monthly)
      const categoryMap = new Map<ExpenseCategory, number>();
      let totalMonthly = 0;

      plans.forEach(plan => {
        const category = (plan.category || 'Others') as ExpenseCategory;
        const amount = plan.amount || 0;
        let monthlyAmount = amount;
        
        if (plan.frequency === 'yearly') {
          monthlyAmount = amount / 12;
        } else if (plan.frequency === 'weekly') {
          monthlyAmount = amount * 4.33;
        } else if (plan.frequency === 'daily') {
          monthlyAmount = amount * 30;
        }

        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + monthlyAmount);
        totalMonthly += monthlyAmount;
      });

      return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0,
      })).sort((a, b) => b.amount - a.amount);
    },
  });

  // Top recurring items (last 3 months)
  const {
    data: topItems = [],
    isLoading: isLoadingTopItems,
  } = useQuery({
    queryKey: ['recurring-analytics', 'top-items'],
    queryFn: async (): Promise<TopRecurringItem[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');

      // Get paid occurrences in last 3 months
      const { data: occurrences } = await supabase
        .from('recurring_occurrences')
        .select('plan_id, amount')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('occurrence_date', threeMonthsAgo);

      if (!occurrences || occurrences.length === 0) return [];

      // Aggregate by plan
      const planSpendMap = new Map<string, { total: number; count: number }>();
      let grandTotal = 0;

      occurrences.forEach(occ => {
        const current = planSpendMap.get(occ.plan_id) || { total: 0, count: 0 };
        current.total += occ.amount || 0;
        current.count += 1;
        planSpendMap.set(occ.plan_id, current);
        grandTotal += occ.amount || 0;
      });

      // Fetch plan details
      const planIds = Array.from(planSpendMap.keys());
      const { data: plans } = await supabase
        .from('recurring_transactions')
        .select('id, name, category, amount, frequency, bank_account_id')
        .in('id', planIds);

      // Fetch bank names
      const bankIds = plans?.map(p => p.bank_account_id).filter(Boolean) || [];
      const { data: banks } = await supabase
        .from('bank_accounts')
        .select('id, name')
        .in('id', bankIds);

      const bankMap = new Map(banks?.map(b => [b.id, b.name]) || []);
      const plansMap = new Map(plans?.map(p => [p.id, p]) || []);

      // Build top items
      const items: TopRecurringItem[] = [];
      planSpendMap.forEach((spend, planId) => {
        const plan = plansMap.get(planId);
        if (!plan) return;

        let monthlyAmount = plan.amount || 0;
        if (plan.frequency === 'yearly') monthlyAmount /= 12;
        else if (plan.frequency === 'weekly') monthlyAmount *= 4.33;
        else if (plan.frequency === 'daily') monthlyAmount *= 30;

        items.push({
          planId,
          name: plan.name || 'Unnamed',
          category: (plan.category || 'Others') as ExpenseCategory,
          bankName: plan.bank_account_id ? bankMap.get(plan.bank_account_id) || null : null,
          monthlyAmount,
          totalSpend: spend.total,
          occurrenceCount: spend.count,
          shareOfTotal: grandTotal > 0 ? (spend.total / grandTotal) * 100 : 0,
        });
      });

      return items.sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);
    },
  });

  return {
    analytics: analytics || {
      monthlyCommitment: 0,
      thisMonthSpend: 0,
      activePlansCount: 0,
      largestRecurring: null,
    },
    monthlyTrend,
    categoryBreakdown,
    topItems,
    isLoading: isLoadingAnalytics || isLoadingTrend || isLoadingCategories || isLoadingTopItems,
  };
}
