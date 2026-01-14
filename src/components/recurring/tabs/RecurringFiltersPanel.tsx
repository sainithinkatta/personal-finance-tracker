import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RecurringFilters, PlanStatus } from '@/types/recurringPlan';
import { ExpenseCategory } from '@/types/expense';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { Search, X } from 'lucide-react';

interface RecurringFiltersPanelProps {
  filters: RecurringFilters;
  onFiltersChange: (filters: RecurringFilters) => void;
  showPlanStatusFilter?: boolean;
}

const CATEGORIES: ExpenseCategory[] = ['Groceries', 'Food', 'Travel', 'Bills', 'Others'];

export const RecurringFiltersPanel: React.FC<RecurringFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  showPlanStatusFilter = false,
}) => {
  const { bankAccounts } = useBankAccounts();

  const hasActiveFilters = filters.search || filters.category !== 'all' || 
    filters.bankAccountId !== 'all' || filters.dateStart || filters.dateEnd ||
    (showPlanStatusFilter && filters.planStatus !== 'all');

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      bankAccountId: 'all',
      planStatus: showPlanStatusFilter ? 'active' : 'all',
      dateStart: '',
      dateEnd: '',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(v) => onFiltersChange({ ...filters, category: v as ExpenseCategory | 'all' })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bank */}
        <Select
          value={filters.bankAccountId}
          onValueChange={(v) => onFiltersChange({ ...filters, bankAccountId: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Banks</SelectItem>
            {bankAccounts.map(bank => (
              <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Plan Status (optional) */}
        {showPlanStatusFilter && (
          <Select
            value={filters.planStatus}
            onValueChange={(v) => onFiltersChange({ ...filters, planStatus: v as PlanStatus | 'all' })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Clear */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Date Range */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">From:</Label>
          <Input
            type="date"
            value={filters.dateStart}
            onChange={(e) => onFiltersChange({ ...filters, dateStart: e.target.value })}
            className="w-[150px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">To:</Label>
          <Input
            type="date"
            value={filters.dateEnd}
            onChange={(e) => onFiltersChange({ ...filters, dateEnd: e.target.value })}
            className="w-[150px]"
          />
        </div>
      </div>
    </div>
  );
};
