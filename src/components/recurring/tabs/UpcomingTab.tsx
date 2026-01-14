import React, { useState, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { useRecurringPlans } from '@/hooks/useRecurringPlans';
import { useRecurringOccurrences } from '@/hooks/useRecurringOccurrences';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { RecurringPlanWithComputed, RecurringFilters, DEFAULT_RECURRING_FILTERS } from '@/types/recurringPlan';
import { RecurringFiltersPanel } from './RecurringFiltersPanel';
import { MarkAsPaidDialog } from '../dialogs/MarkAsPaidDialog';
import { SkipOccurrenceDialog } from '../dialogs/SkipOccurrenceDialog';
import { EditPlanDialog } from '../dialogs/EditPlanDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check,
  SkipForward,
  Edit,
  Calendar,
  AlertCircle,
  Building2,
  Clock
} from 'lucide-react';
import { RecurringCard } from '../RecurringCard';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getFrequencyBadgeClass = (frequency: string) => {
  switch (frequency) {
    case 'daily':
      return 'bg-info-muted text-info-foreground border-info/20';
    case 'weekly':
      return 'bg-accent-muted text-accent-foreground border-accent/20';
    case 'monthly':
      return 'bg-warning-muted text-warning-foreground border-warning/20';
    case 'yearly':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

const getDueStatusInfo = (daysUntilDue: number) => {
  if (daysUntilDue < 0) {
    return {
      text: `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'} overdue`,
      className: 'text-destructive',
      icon: AlertCircle,
    };
  } else if (daysUntilDue === 0) {
    return {
      text: 'Due today',
      className: 'text-destructive',
      icon: Clock,
    };
  } else if (daysUntilDue === 1) {
    return {
      text: 'Due tomorrow',
      className: 'text-warning',
      icon: Clock,
    };
  } else if (daysUntilDue <= 7) {
    return {
      text: `Due in ${daysUntilDue} days`,
      className: 'text-warning',
      icon: Calendar,
    };
  } else {
    return {
      text: `Due in ${daysUntilDue} days`,
      className: 'text-muted-foreground',
      icon: Calendar,
    };
  }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const UpcomingTab: React.FC = () => {
  const { activePlans, isLoading } = useRecurringPlans();
  const { markAsPaid, skipOccurrence, isMarkingPaid, isSkipping } = useRecurringOccurrences();
  const { bankAccounts } = useBankAccounts();

  const [filters, setFilters] = useState<RecurringFilters>(DEFAULT_RECURRING_FILTERS);
  const [selectedPlan, setSelectedPlan] = useState<RecurringPlanWithComputed | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Apply filters
  const filteredPlans = useMemo(() => {
    return activePlans.filter(plan => {
      // Search filter
      if (filters.search && !plan.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filters.category !== 'all' && plan.category !== filters.category) {
        return false;
      }
      // Bank filter
      if (filters.bankAccountId !== 'all' && plan.bank_account_id !== filters.bankAccountId) {
        return false;
      }
      // Date range filters
      if (filters.dateStart) {
        const planDate = parseLocalDate(plan.next_due_date);
        const startDate = parseLocalDate(filters.dateStart);
        if (planDate < startDate) return false;
      }
      if (filters.dateEnd) {
        const planDate = parseLocalDate(plan.next_due_date);
        const endDate = parseLocalDate(filters.dateEnd);
        if (planDate > endDate) return false;
      }
      return true;
    });
  }, [activePlans, filters]);

  // Sort by due date (most urgent first)
  const sortedPlans = useMemo(() => {
    return [...filteredPlans].sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [filteredPlans]);

  const handleMarkAsPaid = (plan: RecurringPlanWithComputed) => {
    setSelectedPlan(plan);
    setShowPayDialog(true);
  };

  const handleSkip = (plan: RecurringPlanWithComputed) => {
    setSelectedPlan(plan);
    setShowSkipDialog(true);
  };

  const handleEdit = (plan: RecurringPlanWithComputed) => {
    setSelectedPlan(plan);
    setShowEditDialog(true);
  };

  const confirmPayment = (bankAccountId: string) => {
    if (!selectedPlan) return;
    markAsPaid({
      planId: selectedPlan.id,
      bankAccountId,
      occurrenceDate: selectedPlan.next_due_date,
      amount: selectedPlan.amount,
      frequency: selectedPlan.frequency,
    });
    setShowPayDialog(false);
    setSelectedPlan(null);
  };

  const confirmSkip = () => {
    if (!selectedPlan) return;
    skipOccurrence({
      planId: selectedPlan.id,
      occurrenceDate: selectedPlan.next_due_date,
      amount: selectedPlan.amount,
      frequency: selectedPlan.frequency,
    });
    setShowSkipDialog(false);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const getBankName = (bankId: string | null) => {
    if (!bankId) return 'No bank assigned';
    return bankAccounts.find(b => b.id === bankId)?.name || 'Unknown bank';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <RecurringFiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        showPlanStatusFilter={false}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {sortedPlans.length} upcoming payment{sortedPlans.length !== 1 ? 's' : ''}
      </div>

      {/* Upcoming list */}
      {sortedPlans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-1">No upcoming payments</h3>
            <p className="text-muted-foreground text-sm">
              {activePlans.length === 0
                ? 'Create a recurring plan to see upcoming payments here.'
                : 'No payments match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPlans.map((plan) => (
            <RecurringCard
              key={plan.id}
              name={plan.name}
              category={plan.category}
              bankName={getBankName(plan.bank_account_id)}
              amount={plan.amount}
              currency={plan.currency}
              frequency={plan.frequency}
              nextDueDate={plan.next_due_date}
              daysUntilDue={plan.daysUntilDue}
              isOverdue={plan.isOverdue}
              variant="upcoming"
              onMarkAsPaid={() => handleMarkAsPaid(plan)}
              onSkip={() => handleSkip(plan)}
              onEdit={() => handleEdit(plan)}
              isMarkingPaid={isMarkingPaid}
              isSkipping={isSkipping}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <MarkAsPaidDialog
        plan={selectedPlan}
        isOpen={showPayDialog}
        onClose={() => setShowPayDialog(false)}
        onConfirm={confirmPayment}
        isLoading={isMarkingPaid}
      />

      <SkipOccurrenceDialog
        plan={selectedPlan}
        isOpen={showSkipDialog}
        onClose={() => setShowSkipDialog(false)}
        onConfirm={confirmSkip}
        isLoading={isSkipping}
      />

      <EditPlanDialog
        plan={selectedPlan}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedPlan(null);
        }}
      />
    </div>
  );
};
