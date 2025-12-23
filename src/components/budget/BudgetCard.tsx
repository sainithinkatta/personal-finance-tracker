import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Settings, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Budget } from '@/types/budget';
import { formatCurrency, getBudgetSummary, getCategoryRemaining } from '@/utils/budgetUtils';
import { categoryIcons, categoryConfig, BudgetCategoryName } from '@/constants/categoryConfig';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onAllocate: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onAllocate,
  onDelete
}) => {
  // Use unified budget summary (SOURCE OF TRUTH)
  const summary = getBudgetSummary(budget);
  const isOverBudget = summary.status === 'over_budget';
  const isFullyAllocated = summary.allocated === summary.budget;

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const CategoryItem = ({ category }: { category: BudgetCategoryName }) => {
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
            <span className="text-sm font-medium text-gray-900">{category}</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold ${isOverCategory ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(spent, budget.currency)}
            </div>
            <div className="text-xs text-gray-500">
              of {formatCurrency(allocated, budget.currency)}
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isOverCategory ? 'bg-red-500' : config.progress
              }`}
              style={{ width: `${Math.min(categoryProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-xs font-medium ${isOverCategory ? 'text-red-600' : config.color}`}>
              {Math.round(categoryProgress)}%
            </span>
            {categoryRemaining >= 0 ? (
              <span className="text-xs text-gray-500">
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
    <Card className="group relative bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Colored top border indicator */}
      <div className={`h-1 ${
        summary.status === 'over_budget' ? 'bg-red-500' :
        summary.status === 'warning' ? 'bg-amber-500' :
        'bg-emerald-500'
      }`} />
      
      {/* Header */}
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold text-gray-900">{budget.name}</h3>
              {isOverBudget && (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-xs">
                {getMonthName(budget.month)} {budget.year}
              </Badge>
              <Badge className={`${summary.statusColors.badge} border font-medium text-xs`}>
                {summary.statusLabel}
              </Badge>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAllocate(budget)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              title="Allocate Categories"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
              title="Edit Budget"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
              title="Delete Budget"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Main Budget Stats */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Spent Amount */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Total Spent
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(summary.spent, budget.currency)}
                </span>
                {isOverBudget && (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Remaining/Over Amount */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {summary.remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(summary.remaining), budget.currency)}
                </span>
                {summary.remaining < 0 && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Percentage Used */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Used
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${
                  summary.status === 'over_budget' ? 'text-red-600' :
                  summary.status === 'warning' ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  {summary.usedPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${summary.statusColors.bar}`}
                style={{ width: `${Math.min(summary.usedPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Allocation Status */}
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <div className="bg-white border border-gray-200 rounded-lg p-2.5">
            <div className="text-xs font-medium text-gray-500 mb-0.5">Budget</div>
            <div className="text-base font-bold text-blue-600">
              {formatCurrency(summary.budget, budget.currency)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2.5">
            <div className="text-xs font-medium text-gray-500 mb-0.5">Allocated</div>
            <div className="text-base font-bold text-purple-600">
              {formatCurrency(summary.allocated, budget.currency)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-4">
        {/* Category Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Category Breakdown</h4>
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
                    You have {formatCurrency(summary.budget - summary.allocated, budget.currency)} unallocated.
                    Click the settings icon to distribute funds across categories.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {(['Travel', 'Groceries', 'Bills', 'Food', 'Others'] as BudgetCategoryName[]).map(category => (
                <CategoryItem key={category} category={category} />
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