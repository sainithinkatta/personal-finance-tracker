/**
 * =====================================================
 * COMPLETED TAB
 * =====================================================
 * 
 * History of paid and skipped occurrences.
 */

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { useRecurringOccurrences } from '@/hooks/useRecurringOccurrences';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { RecurringFilters, DEFAULT_RECURRING_FILTERS } from '@/types/recurringPlan';
import { RecurringFiltersPanel } from './RecurringFiltersPanel';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, SkipForward, History, Building2, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getOccurrenceStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return { 
        label: 'Paid', 
        className: 'bg-accent-muted text-accent-foreground border-accent/20',
        icon: Check 
      };
    case 'skipped':
      return { 
        label: 'Skipped', 
        className: 'bg-muted text-muted-foreground border-border',
        icon: SkipForward 
      };
    default:
      return { 
        label: status, 
        className: 'bg-muted text-muted-foreground',
        icon: null 
      };
  }
};

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

// =====================================================
// MAIN COMPONENT
// =====================================================

export const CompletedTab: React.FC = () => {
  const { completedOccurrences, isLoadingCompleted } = useRecurringOccurrences();
  const { bankAccounts } = useBankAccounts();
  const isMobile = useIsMobile();
  
  const [filters, setFilters] = useState<RecurringFilters>(DEFAULT_RECURRING_FILTERS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'skipped'>('all');

  // Apply filters
  const filteredOccurrences = useMemo(() => {
    return completedOccurrences.filter(occ => {
      // Search filter (by plan name)
      if (filters.search && occ.plan) {
        if (!occ.plan.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
      }
      // Category filter
      if (filters.category !== 'all' && occ.plan?.category !== filters.category) {
        return false;
      }
      // Bank filter
      if (filters.bankAccountId !== 'all' && occ.bank_account_id !== filters.bankAccountId) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && occ.status !== statusFilter) {
        return false;
      }
      // Date range filters
      if (filters.dateStart) {
        const occDate = parseLocalDate(occ.occurrence_date);
        const startDate = parseLocalDate(filters.dateStart);
        if (occDate < startDate) return false;
      }
      if (filters.dateEnd) {
        const occDate = parseLocalDate(occ.occurrence_date);
        const endDate = parseLocalDate(filters.dateEnd);
        if (occDate > endDate) return false;
      }
      return true;
    });
  }, [completedOccurrences, filters, statusFilter]);

  const getBankName = (bankId: string | null) => {
    if (!bankId) return 'No bank';
    return bankAccounts.find(b => b.id === bankId)?.name || 'Unknown';
  };

  // Count stats
  const paidCount = completedOccurrences.filter(o => o.status === 'paid').length;
  const skippedCount = completedOccurrences.filter(o => o.status === 'skipped').length;

  if (isLoadingCompleted) {
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
      <div className="flex items-start gap-4 overflow-x-auto">
        <RecurringFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          showPlanStatusFilter={false}
        />
        <div className="flex-shrink-0 pt-4">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'paid' | 'skipped')}>
            <SelectTrigger className="h-[42px] rounded-lg border border-slate-200 bg-white text-sm text-slate-700 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({paidCount + skippedCount})</SelectItem>
              <SelectItem value="paid">Paid ({paidCount})</SelectItem>
              <SelectItem value="skipped">Skipped ({skippedCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredOccurrences.length} occurrence{filteredOccurrences.length !== 1 ? 's' : ''}
      </div>

      {/* Occurrences list */}
      {filteredOccurrences.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-1">No payment history</h3>
            <p className="text-muted-foreground text-sm">
              {completedOccurrences.length === 0 
                ? 'Completed payments will appear here.'
                : 'No payments match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile: Card layout
        <div className="space-y-3">
          {filteredOccurrences.map((occ) => {
            const statusBadge = getOccurrenceStatusBadge(occ.status);
            const occDate = parseLocalDate(occ.occurrence_date);
            const StatusIcon = statusBadge.icon;
            const planCurrency = occ.plan?.currency || 'USD';

            return (
              <Card key={occ.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <h3 className="font-medium truncate" title={occ.plan?.name || 'Unknown Plan'}>{occ.plan?.name || 'Unknown Plan'}</h3>
                      <p className="text-sm text-muted-foreground">{occ.plan?.category || 'Others'}</p>
                    </div>
                    <Badge variant="outline" className={statusBadge.className}>
                      {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(occDate, 'EEEE, MMM d, yyyy')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{getBankName(occ.bank_account_id)}</span>
                  </div>

                  <div className="text-lg font-semibold">
                    {getCurrencySymbol(planCurrency)}{occ.amount.toFixed(2)}
                  </div>

                  {occ.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {occ.notes}
                    </p>
                  )}
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
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccurrences.map((occ) => {
                const statusBadge = getOccurrenceStatusBadge(occ.status);
                const occDate = parseLocalDate(occ.occurrence_date);
                const StatusIcon = statusBadge.icon;
                const planCurrency = occ.plan?.currency || 'USD';

                return (
                  <TableRow key={occ.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{format(occDate, 'MMM d, yyyy')}</span>
                        <span className="text-xs text-muted-foreground">{format(occDate, 'EEEE')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px]">
                      <span className="block truncate" title={occ.plan?.name || 'Unknown Plan'}>{occ.plan?.name || 'Unknown Plan'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {occ.plan?.category || 'Others'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getBankName(occ.bank_account_id)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {getCurrencySymbol(planCurrency)}{occ.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge.className}>
                        {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {occ.notes || '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
