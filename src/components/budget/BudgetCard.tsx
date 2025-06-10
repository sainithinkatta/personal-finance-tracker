import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Settings, Plane, ShoppingCart, Zap, Package, AlertTriangle } from 'lucide-react';
import { Budget } from '@/types/budget';
import { formatCurrency, getBudgetProgress, getCategoryRemaining, getTotalSpent } from '@/utils/budgetUtils';

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
  Others: Package,
};

const categoryConfig = {
  Travel: { 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    ring: 'ring-blue-200',
    progress: 'bg-gradient-to-r from-blue-400 to-blue-600'
  },
  Groceries: { 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    ring: 'ring-emerald-200',
    progress: 'bg-gradient-to-r from-emerald-400 to-emerald-600'
  },
  Bills: { 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    ring: 'ring-amber-200',
    progress: 'bg-gradient-to-r from-amber-400 to-amber-600'
  },
  Others: { 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    ring: 'ring-purple-200',
    progress: 'bg-gradient-to-r from-purple-400 to-purple-600'
  },
};

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onAllocate,
  onDelete
}) => {
  const totalSpent = getTotalSpent(budget);
  const totalAllocated = (budget.travel_allocated || 0) + (budget.groceries_allocated || 0) + 
                        (budget.bills_allocated || 0) + (budget.others_allocated || 0);
  const progress = getBudgetProgress(budget);
  const isOverBudget = progress > 100;
  const isFullyAllocated = totalAllocated === budget.total_amount;
  const remaining = budget.total_amount - totalSpent;

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600';
    if (progress > 80) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getStatusBg = () => {
    if (isOverBudget) return 'bg-red-50 border-red-200';
    if (progress > 80) return 'bg-amber-50 border-amber-200';
    return 'bg-emerald-50 border-emerald-200';
  };

  // Enhanced category display
  const CategoryItem = ({ category }: { category: keyof typeof categoryIcons }) => {
    const allocated = budget[`${category.toLowerCase()}_allocated` as keyof Budget] as number || 0;
    const spent = budget[`${category.toLowerCase()}_spent` as keyof Budget] as number || 0;
    const categoryProgress = allocated > 0 ? (spent / allocated) * 100 : 0;
    const IconComponent = categoryIcons[category];
    const config = categoryConfig[category];
    
    if (allocated === 0) return null;

    return (
      <div className="group relative">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${config.bg} ${config.color} ring-1 ${config.ring}`}>
              <IconComponent className="h-3 w-3" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-xs">{category}</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(spent, budget.currency)} of {formatCurrency(allocated, budget.currency)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-bold ${categoryProgress > 100 ? 'text-red-600' : 'text-gray-900'}`}>
              {Math.round(categoryProgress)}%
            </div>
            <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  categoryProgress > 100 ? 'bg-red-500' : config.progress
                }`}
                style={{ width: `${Math.min(categoryProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="group relative bg-white shadow-sm hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-gray-200 hover:ring-gray-300 overflow-hidden h-full flex flex-col">
      {/* Header with improved layout */}
      <CardHeader className="py-2 px-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between">
          {/* Left: title, month badge, status */}
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-gray-900">{budget.name}</h3>
            <Badge
              variant="secondary"
              className="bg-white/80 backdrop-blur-sm text-gray-700 font-medium px-2 py-0.5 text-xs"
            >
              {getMonthName(budget.month)} {budget.year}
            </Badge>
            <div
              className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border 
                ${getStatusBg()}
              `}
            >
              {isOverBudget ? (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Over Budget
                </>
              ) : progress > 80 ? (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Nearly Full
                </>
              ) : (
                <>On Track</>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAllocate(budget)}
              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-full"
              title="Allocate Categories"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              title="Edit Budget"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget)}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
              title="Delete Budget"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 space-y-8">
        {/* Budget Overview Section  */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            {/* Spent Amount */}
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-500">Spent</div>
                <div className="text-lg font-bold">
                  <span className={getStatusColor()}>
                    {formatCurrency(totalSpent, budget.currency)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                / {formatCurrency(budget.total_amount, budget.currency)}
              </div>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {remaining >= 0 ? (
                <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                  {formatCurrency(remaining, budget.currency)} left
                </div>
              ) : (
                <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                  {formatCurrency(Math.abs(remaining), budget.currency)} over
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-500">Budget</div>
                <div className="font-semibold text-blue-700">
                  {formatCurrency(budget.total_amount, budget.currency)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Allocated</div>
                <div className="font-semibold text-purple-700">
                  {formatCurrency(totalAllocated, budget.currency)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Category Breakdown</h4>
            {!isFullyAllocated && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                Incomplete Allocation
              </Badge>
            )}
          </div>
          
          {!isFullyAllocated ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="p-1.5 bg-amber-100 rounded-md">
                  <Settings className="h-3 w-3 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-900 text-xs">Category allocation incomplete</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    You have {formatCurrency(budget.total_amount - totalAllocated, budget.currency)} unallocated. 
                    Click the settings button to distribute funds across categories.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {['Travel', 'Groceries', 'Bills', 'Others'].map(category => (
                <CategoryItem key={category} category={category as keyof typeof categoryIcons} />
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        {budget.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
            <div className="text-xs text-gray-600 leading-relaxed">{budget.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};