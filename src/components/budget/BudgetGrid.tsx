
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
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      {budgets.map(budget => (
        <div key={budget.id} className="h-full">
          <BudgetCard
            budget={budget}
            onEdit={onEdit}
            onAllocate={onAllocate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};
