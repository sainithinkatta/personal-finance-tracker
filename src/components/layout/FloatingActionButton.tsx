
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import ExpenseForm from '@/components/ExpenseForm';
import { useExpenses } from '@/hooks/useExpenses';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addExpense } = useExpenses();

  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        className="fixed right-4 h-14 w-14 rounded-full shadow-lg lg:hidden z-50 bg-primary hover:bg-primary/90 active:scale-95 transition-transform duration-150 touch-target"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        onClick={() => setIsOpen(true)}
        aria-label="Add new expense"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <BottomSheet open={isOpen} onOpenChange={setIsOpen}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Add Expense</BottomSheetTitle>
          </BottomSheetHeader>
          <BottomSheetBody>
            <ExpenseForm
              onAddExpense={handleAddExpense}
              onClose={() => setIsOpen(false)}
            />
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};

export default FloatingActionButton;
