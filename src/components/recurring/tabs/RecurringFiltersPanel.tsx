import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecurringFilters, PlanStatus } from '@/types/recurringPlan';
import { ExpenseCategory } from '@/types/expense';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { Search } from 'lucide-react';

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

  const baseInputClass =
    "h-[42px] rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500";
  const baseSelectTriggerClass =
    "h-[42px] rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="filter-bar flex items-center gap-3 py-4 overflow-x-auto">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className={`${baseInputClass} w-[220px] pl-11 pr-4`}
        />
      </div>

      {/* Category */}
      <div className="flex-shrink-0">
        <Select
          value={filters.category}
          onValueChange={(v) => onFiltersChange({ ...filters, category: v as ExpenseCategory | 'all' })}
        >
          <SelectTrigger className={`${baseSelectTriggerClass} min-w-[140px] px-[14px] pr-9 justify-between`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bank */}
      <div className="flex-shrink-0">
        <Select
          value={filters.bankAccountId}
          onValueChange={(v) => onFiltersChange({ ...filters, bankAccountId: v })}
        >
          <SelectTrigger className={`${baseSelectTriggerClass} min-w-[140px] px-[14px] pr-9 justify-between`}>
            <SelectValue placeholder="Bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Banks</SelectItem>
            {bankAccounts.map(bank => (
              <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Status (optional) */}
      {showPlanStatusFilter && (
        <div className="flex-shrink-0">
          <Select
            value={filters.planStatus}
            onValueChange={(v) => onFiltersChange({ ...filters, planStatus: v as PlanStatus | 'all' })}
          >
            <SelectTrigger className={`${baseSelectTriggerClass} min-w-[130px] px-[14px] pr-9 justify-between`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date Range */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Label className="text-xs font-medium text-slate-500 whitespace-nowrap">From:</Label>
        <Input
          type="date"
          value={filters.dateStart}
          onChange={(e) => onFiltersChange({ ...filters, dateStart: e.target.value })}
          className={`${baseInputClass} w-[140px] px-2`}
        />
        <Label className="text-xs font-medium text-slate-500 whitespace-nowrap ml-1">To:</Label>
        <Input
          type="date"
          value={filters.dateEnd}
          onChange={(e) => onFiltersChange({ ...filters, dateEnd: e.target.value })}
          className={`${baseInputClass} w-[140px] px-2`}
        />
      </div>
    </div>
  );
};
