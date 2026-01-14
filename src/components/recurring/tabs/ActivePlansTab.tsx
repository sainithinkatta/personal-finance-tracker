/**
 * =====================================================
 * ACTIVE PLANS TAB
 * =====================================================
 * 
 * Manage recurring plans (templates).
 * Actions: Edit, Pause/Resume, Cancel, Delete
 */

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { useRecurringPlans } from '@/hooks/useRecurringPlans';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { RecurringPlanWithComputed, RecurringFilters, DEFAULT_RECURRING_FILTERS, PlanStatus } from '@/types/recurringPlan';
import { RecurringFiltersPanel } from './RecurringFiltersPanel';
import { EditPlanDialog } from '../dialogs/EditPlanDialog';
import { CancelPlanDialog } from '../dialogs/CancelPlanDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Edit, 
  Pause, 
  Play, 
  XCircle, 
  Trash2,
  Building2,
  ListChecks,
  Calendar
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getPlanStatusBadge = (status: PlanStatus) => {
  switch (status) {
    case 'active':
      return { label: 'Active', className: 'bg-accent-muted text-accent-foreground border-accent/20' };
    case 'paused':
      return { label: 'Paused', className: 'bg-warning-muted text-warning-foreground border-warning/20' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' };
  }
};

const getFrequencyBadgeClass = (frequency: string) => {
  switch (frequency) {
    case 'daily': return 'bg-info-muted text-info-foreground';
    case 'weekly': return 'bg-accent-muted text-accent-foreground';
    case 'monthly': return 'bg-warning-muted text-warning-foreground';
    case 'yearly': return 'bg-primary/10 text-primary';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

// =====================================================
// MAIN COMPONENT
// =====================================================

export const ActivePlansTab: React.FC = () => {
  const { plans, isLoading, pausePlan, resumePlan, cancelPlan, deletePlan, isPausing, isResuming, isCancelling, isDeleting } = useRecurringPlans();
  const { bankAccounts } = useBankAccounts();
  const isMobile = useIsMobile();
  
  const [filters, setFilters] = useState<RecurringFilters>({
    ...DEFAULT_RECURRING_FILTERS,
    planStatus: 'active', // Default to showing only active plans
  });
  const [selectedPlan, setSelectedPlan] = useState<RecurringPlanWithComputed | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Apply filters
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
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
      // Plan status filter
      if (filters.planStatus !== 'all' && plan.plan_status !== filters.planStatus) {
        return false;
      }
      return true;
    });
  }, [plans, filters]);

  const getBankName = (bankId: string | null) => {
    if (!bankId) return 'No bank';
    return bankAccounts.find(b => b.id === bankId)?.name || 'Unknown';
  };

  const handleEdit = (plan: RecurringPlanWithComputed) => {
    setSelectedPlan(plan);
    setShowEditDialog(true);
  };

  const handlePauseResume = (plan: RecurringPlanWithComputed) => {
    if (plan.plan_status === 'paused') {
      resumePlan(plan.id);
    } else {
      pausePlan(plan.id);
    }
  };

  const handleCancelClick = (plan: RecurringPlanWithComputed) => {
    setSelectedPlan(plan);
    setShowCancelDialog(true);
  };

  const handleDeleteClick = (plan: RecurringPlanWithComputed) => {
    setSelectedPlan(plan);
    setShowDeleteDialog(true);
  };

  const confirmCancel = () => {
    if (selectedPlan) {
      cancelPlan(selectedPlan.id);
      setShowCancelDialog(false);
      setSelectedPlan(null);
    }
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      deletePlan(selectedPlan.id);
      setShowDeleteDialog(false);
      setSelectedPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <RecurringFiltersPanel 
        filters={filters} 
        onFiltersChange={setFilters}
        showPlanStatusFilter={true}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
      </div>

      {/* Plans list */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-1">No plans found</h3>
            <p className="text-muted-foreground text-sm">
              {plans.length === 0 
                ? 'Create your first recurring plan to get started.'
                : 'No plans match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile: Card layout
        <div className="space-y-3">
          {filteredPlans.map((plan) => {
            const statusBadge = getPlanStatusBadge(plan.plan_status);
            const dueDate = parseLocalDate(plan.next_due_date);

            return (
              <Card key={plan.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.category}</p>
                    </div>
                    <Badge variant="outline" className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{getBankName(plan.bank_account_id)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-3">
                    <span className="font-semibold">
                      {getCurrencySymbol(plan.currency)}{plan.amount.toFixed(2)}
                    </span>
                    <Badge className={`text-xs ${getFrequencyBadgeClass(plan.frequency)}`}>
                      {plan.frequency}
                    </Badge>
                  </div>

                  {plan.plan_status !== 'cancelled' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>Next: {format(dueDate, 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {plan.plan_status !== 'cancelled' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePauseResume(plan)}
                          disabled={isPausing || isResuming}
                        >
                          {plan.plan_status === 'paused' ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCancelClick(plan)}
                          disabled={isCancelling}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteClick(plan)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Desktop: Table layout
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => {
                const statusBadge = getPlanStatusBadge(plan.plan_status);
                const dueDate = parseLocalDate(plan.next_due_date);

                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {plan.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getBankName(plan.bank_account_id)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getFrequencyBadgeClass(plan.frequency)}`}>
                        {plan.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {getCurrencySymbol(plan.currency)}{plan.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.plan_status !== 'cancelled' 
                        ? format(dueDate, 'MMM d, yyyy')
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {plan.plan_status !== 'cancelled' && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handlePauseResume(plan)}
                              disabled={isPausing || isResuming}
                              title={plan.plan_status === 'paused' ? 'Resume' : 'Pause'}
                            >
                              {plan.plan_status === 'paused' ? (
                                <Play className="h-4 w-4 text-accent" />
                              ) : (
                                <Pause className="h-4 w-4 text-warning" />
                              )}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleCancelClick(plan)}
                              disabled={isCancelling}
                              title="Cancel plan"
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDeleteClick(plan)}
                          disabled={isDeleting}
                          title="Delete plan"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <EditPlanDialog
        plan={selectedPlan}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedPlan(null);
        }}
      />

      <CancelPlanDialog
        plan={selectedPlan}
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancel}
        isLoading={isCancelling}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        entityName="Recurring Plan"
        itemIdentifier={selectedPlan?.name || undefined}
        additionalInfo="This will also remove all payment history for this plan."
        isLoading={isDeleting}
      />
    </div>
  );
};
