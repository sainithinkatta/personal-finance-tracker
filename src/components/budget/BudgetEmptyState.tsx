import React from 'react';
import { PieChart } from 'lucide-react';

export const BudgetEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        <PieChart className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No Budgets Yet</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Create your first monthly budget to track spending across categories like Travel, Groceries, Bills, and Others.
      </p>
    </div>
  );
};