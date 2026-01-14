/**
 * =====================================================
 * UPCOMING TAB
 * =====================================================
 * 
 * Shows next scheduled payments from active plans.
 * Actions: Mark as Paid, Skip, Edit
 */

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
          {sortedPlans.map((plan) => {
            const dueDate = parseLocalDate(plan.next_due_date);
            const dueInfo = getDueStatusInfo(plan.daysUntilDue);
            const DueIcon = dueInfo.icon;

            return (
              <Card 
                key={plan.id} 
                className={`overflow-hidden transition-all hover:shadow-md ${
                  plan.isOverdue ? 'border-destructive/50 bg-destructive/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Header: Amount & Category */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      className={`text-xs px-2 py-0.5 ${
                        plan.category === 'Bills' ? 'bg-red-100 text-red-800' :
                        plan.category === 'Groceries' ? 'bg-green-100 text-green-800' :
                        plan.category === 'Food' ? 'bg-orange-100 text-orange-800' :
                        plan.category === 'Travel' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {plan.category}
                    </Badge>
                    <span className="text-xl font-bold">
                      {getCurrencySymbol(plan.currency)}{plan.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-medium text-foreground mb-2 line-clamp-1">
                    {plan.name}
                  </h3>

                  {/* Bank */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{getBankName(plan.bank_account_id)}</span>
                  </div>

                  {/* Due date & frequency */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <div className={`flex items-center gap-1 text-sm ${dueInfo.className}`}>
                      <DueIcon className="h-3.5 w-3.5" />
                      <span>{dueInfo.text}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getFrequencyBadgeClass(plan.frequency)}`}>
                      {plan.frequency.charAt(0).toUpperCase() + plan.frequency.slice(1)}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-muted-foreground mb-4">
                    {format(dueDate, 'EEEE, MMM d, yyyy')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsPaid(plan)}
                      disabled={isMarkingPaid}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSkip(plan)}
                      disabled={isSkipping}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
