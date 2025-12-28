
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Budget, CategoryAllocations } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const CATEGORIES = ['Travel', 'Groceries', 'Food', 'Bills', 'Others'] as const;

interface CategoryAllocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allocations: CategoryAllocations) => void;
  budget: Budget | null;
  isLoading?: boolean;
}

export const CategoryAllocationForm: React.FC<CategoryAllocationFormProps> = ({
  isOpen,
  onClose,
  onSave,
  budget,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const [allocations, setAllocations] = useState<CategoryAllocations>({
    travel_allocated: 0,
    groceries_allocated: 0,
    food_allocated: 0,
    bills_allocated: 0,
    others_allocated: 0,
  });

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  const remainingToAllocate = budget ? budget.total_amount - totalAllocated : 0;

  useEffect(() => {
    if (budget && isOpen) {
      setAllocations({
        travel_allocated: budget.travel_allocated || 0,
        groceries_allocated: budget.groceries_allocated || 0,
        food_allocated: budget.food_allocated || 0,
        bills_allocated: budget.bills_allocated || 0,
        others_allocated: budget.others_allocated || 0,
      });
    }
  }, [budget, isOpen]);

  const handleAllocationChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const categoryKey = getCategoryKey(category);
    setAllocations(prev => ({
      ...prev,
      [categoryKey]: numValue,
    }));
  };

  const handleSave = () => {
    if (remainingToAllocate === 0) {
      onSave(allocations);
    }
  };

  const getCategoryKey = (category: string): keyof CategoryAllocations => {
    return `${category.toLowerCase()}_allocated` as keyof CategoryAllocations;
  };

  // Don't render if budget is null
  if (!budget) {
    return null;
  }

  const formContent = (
    <>
      <div className="space-y-4 py-4">
        <div className="grid gap-4">
          {CATEGORIES.map(category => (
            <div key={category} className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor={category}>{category}</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                <Input
                  id={category}
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-8 leading-none"
                  value={allocations[getCategoryKey(category)]}
                  onChange={(e) => handleAllocationChange(category, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Allocated:</span>
            <span className="font-medium">
              {formatCurrency(totalAllocated, budget.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Budget Total:</span>
            <span className="font-medium">
              {formatCurrency(budget.total_amount, budget.currency)}
            </span>
          </div>
          <div className={`flex justify-between items-center ${remainingToAllocate !== 0 ? 'text-destructive' : 'text-accent'}`}>
            <span className="font-medium">Remaining to Allocate:</span>
            <span className="font-medium">
              {formatCurrency(remainingToAllocate, budget.currency)}
            </span>
          </div>
        </div>

        {remainingToAllocate !== 0 && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {remainingToAllocate > 0
              ? `You need to allocate ${formatCurrency(remainingToAllocate, budget.currency)} more.`
              : `You have over-allocated by ${formatCurrency(Math.abs(remainingToAllocate), budget.currency)}.`
            }
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={remainingToAllocate !== 0 || isLoading}
        >
          Save Allocations
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Allocate Budget by Category</BottomSheetTitle>
            <p className="text-sm text-muted-foreground">
              Distribute {formatCurrency(budget.total_amount, budget.currency)} across expense categories
            </p>
          </BottomSheetHeader>
          <BottomSheetBody>
            {formContent}
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Allocate Budget by Category</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Distribute {formatCurrency(budget.total_amount, budget.currency)} across expense categories
          </p>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
