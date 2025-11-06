
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden z-50 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-transform duration-150 touch-target"
        onClick={() => setIsOpen(true)}
        aria-label="Add new expense"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm onAddExpense={handleAddExpense} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
