
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BudgetManagerHeaderProps {
  onAddBudget: () => void;
}

export const BudgetManagerHeader: React.FC<BudgetManagerHeaderProps> = ({
  onAddBudget,
}) => {
  return (
    <div className="flex items-center justify-end mb-8">
      <Button
        onClick={onAddBudget}
        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Budget
      </Button>
    </div>
  );
};
