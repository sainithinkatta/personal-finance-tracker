import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BudgetManagerHeaderProps {
  onAddBudget: () => void;
}

const BudgetManagerHeader: React.FC<BudgetManagerHeaderProps> = ({
  onAddBudget,
}) => {
  return (
    <div className="flex w-full justify-end items-center">
      <Button onClick={onAddBudget} className="bg-blue-500 hover:bg-blue-600">
        <Plus className="h-4 w-4" />
        Add Budget
      </Button>
    </div>
  );
};

export default BudgetManagerHeader;
