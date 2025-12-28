import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Settings, Plane, ShoppingCart, Zap, Coffee, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Budget } from '@/types/budget';
import { formatCurrency, getBudgetProgress, getCategoryRemaining, getTotalSpent, getTotalAllocated } from '@/utils/budgetUtils';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onAllocate: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const categoryIcons = {
  Travel: Plane,
  Groceries: ShoppingCart,
  Bills: Zap,
  Food: Coffee,
  Others: Package,
};

const categoryConfig = {
  Travel: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    progress: 'bg-blue-500',
    light: 'bg-blue-100'
  },
  Groceries: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    progress: 'bg-emerald-500',
    light: 'bg-emerald-100'
  },
  Bills: {
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    progress: 'bg-amber-500',
    light: 'bg-amber-100'
  },
  Food: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    progress: 'bg-red-500',
    light: 'bg-red-100'
  },
  Others: {
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    progress: 'bg-purple-500',
    light: 'bg-purple-100'
  },
};

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onAllocate,
  onDelete
}) => {
  const totalSpent = getTotalSpent(budget);
  const totalAllocated = getTotalAllocated(budget);
  const progress = getBudgetProgress(budget);
  const isOverBudget = progress > 100;
  const isFullyAllocated = totalAllocated === budget.total_amount;
  const remaining = budget.total_amount - totalSpent;

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const CategoryItem = ({ category }: { category: keyof typeof categoryIcons }) => {
    const allocated = budget[`${category.toLowerCase()}_allocated` as keyof Budget] as number || 0;
    const spent = budget[`${category.toLowerCase()}_spent` as keyof Budget] as number || 0;
    const categoryProgress = allocated > 0 ? (spent / allocated) * 100 : 0;
    const IconComponent = categoryIcons[category];
    const config = categoryConfig[category];

    if (allocated === 0) return null;

    const isOverCategory = categoryProgress > 100;
    const categoryRemaining = allocated - spent;

    return (
      <div className="group">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}>
              <IconComponent className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium text-foreground">{category}</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold ${isOverCategory ? 'text-red-600' : 'text-foreground'}`}>
              {formatCurrency(spent, budget.currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              of {formatCurrency(allocated, budget.currency)}
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${isOverCategory ? 'bg-red-500' : config.progress
                }`}
              style={{ width: `${Math.min(categoryProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-xs font-medium ${isOverCategory ? 'text-red-600' : config.color}`}>
              {Math.round(categoryProgress)}%
            </span>
            {categoryRemaining >= 0 ? (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(categoryRemaining, budget.currency)} left
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium">
                {formatCurrency(Math.abs(categoryRemaining), budget.currency)} over
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="group relative bg-card hover:shadow-lg transition-all duration-300 border border-border overflow-hidden h-full flex flex-col">
      {/* Colored top border indicator */}
      <div className={`h-1 ${isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} />

      {/* Header */}
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold text-foreground">{budget.name}</h3>
              {isOverBudget && (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 font-medium text-xs">
                {getMonthName(budget.month)} {budget.year}
              </Badge>
              <Badge
                className={`
                  ${isOverBudget
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : progress > 80
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  } border font-medium text-xs
                `}
              >
                {isOverBudget ? 'Over Budget' : progress > 80 ? 'Nearly Full' : 'On Track'}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => onAllocate(budget)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              tooltip="Allocate Categories"
            >
              <Settings className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
              tooltip="Edit Budget"
            >
              <Edit className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
              tooltip="Delete Budget"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>

        {/* Main Budget Stats */}
        <div className="bg-gradient-to-br from-muted/50 to-muted rounded-lg p-3 border border-border">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Spent Amount */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Total Spent
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
                  {formatCurrency(totalSpent, budget.currency)}
                </span>
                {isOverBudget && (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Remaining/Over Amount */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(remaining), budget.currency)}
                </span>
                {remaining < 0 && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Percentage Used */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Used
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${isOverBudget
                  ? 'text-red-600'
                  : progress > 80
                    ? 'text-amber-600'
                    : 'text-blue-600'
                  }`}>
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${isOverBudget
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : progress > 80
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Allocation Status */}
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <div className="bg-card border border-border rounded-lg p-2.5">
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Budget</div>
            <div className="text-base font-bold text-blue-600">
              {formatCurrency(budget.total_amount, budget.currency)}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-2.5">
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Allocated</div>
            <div className="text-base font-bold text-purple-600">
              {formatCurrency(totalAllocated, budget.currency)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-4">
        {/* Category Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground">Category Breakdown</h4>
            {!isFullyAllocated && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                Incomplete
              </Badge>
            )}
          </div>

          {!isFullyAllocated ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Settings className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-900 text-sm mb-0.5">
                    Category allocation incomplete
                  </div>
                  <div className="text-xs text-amber-700 leading-relaxed">
                    You have {formatCurrency(budget.total_amount - totalAllocated, budget.currency)} unallocated.
                    Click the settings icon to distribute funds across categories.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {['Travel', 'Groceries', 'Bills', 'Food', 'Others'].map(category => (
                <CategoryItem key={category} category={category as keyof typeof categoryIcons} />
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        {budget.notes && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-sm font-semibold text-blue-900 mb-0.5">📝 Notes</div>
            </div>
            <div className="text-xs text-blue-800 leading-relaxed">{budget.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};