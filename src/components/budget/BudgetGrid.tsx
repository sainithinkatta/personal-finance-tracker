import React from 'react';
import { Budget } from '@/types/budget';
import { BudgetCard } from './BudgetCard';

interface BudgetGridProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onAllocate: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export const BudgetGrid: React.FC<BudgetGridProps> = ({
  budgets,
  onEdit,
  onAllocate,
  onDelete,
}) => {
  // Empty state
  if (budgets.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
          <svg
            className="w-7 h-7 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1.5">
          No budgets yet
        </h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
          Create your first budget to start tracking your monthly expenses and stay on top of your finances.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-fr">
      {budgets.map(budget => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onAllocate={onAllocate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};