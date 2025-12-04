import React, { useState } from 'react';
import { Plus, X, Receipt, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import ExpenseForm from '@/components/ExpenseForm';
import AddIncomeModal from '@/components/AddIncomeModal';
import { useExpenses } from '@/hooks/useExpenses';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { cn } from '@/lib/utils';

const FloatingActionButton: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const { addExpense } = useExpenses();
  const { bankAccounts } = useBankAccounts();

  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    setIsExpenseOpen(false);
    setIsMenuOpen(false);
  };

  const handleOpenExpense = () => {
    setIsMenuOpen(false);
    setIsExpenseOpen(true);
  };

  const handleOpenIncome = () => {
    setIsMenuOpen(false);
    setIsIncomeOpen(true);
  };

  return (
    <>
      {/* Backdrop when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* FAB Menu Options */}
      <div
        className={cn(
          'fixed right-4 z-50 flex flex-col gap-3 transition-all duration-200 lg:hidden',
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 88px)' }}
      >
        {/* Add Income Option */}
        <div className="flex items-center gap-3">
          <span className="bg-card text-card-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-md">
            Add Income
          </span>
          <Button
            className="h-12 w-12 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-transform duration-150"
            onClick={handleOpenIncome}
            aria-label="Add income"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
        </div>

        {/* Add Expense Option */}
        <div className="flex items-center gap-3">
          <span className="bg-card text-card-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-md">
            Add Expense
          </span>
          <Button
            className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform duration-150"
            onClick={handleOpenExpense}
            aria-label="Add expense"
          >
            <Receipt className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main FAB Button */}
      <Button
        className={cn(
          'fixed right-4 h-14 w-14 rounded-full shadow-lg lg:hidden z-50 active:scale-95 transition-all duration-200 touch-target',
          isMenuOpen
            ? 'bg-muted hover:bg-muted/90 rotate-45'
            : 'bg-blue-600 hover:bg-blue-600/90'
        )}
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? 'Close menu' : 'Open actions menu'}
      >
        {isMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Expense Bottom Sheet */}
      <BottomSheet open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Add Expense</BottomSheetTitle>
          </BottomSheetHeader>
          <BottomSheetBody>
            <ExpenseForm
              onAddExpense={handleAddExpense}
              onClose={() => setIsExpenseOpen(false)}
              bankAccounts={bankAccounts}
            />
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>

      {/* Income Modal (uses BottomSheet internally on mobile) */}
      <AddIncomeModal
        open={isIncomeOpen}
        onOpenChange={setIsIncomeOpen}
      />
    </>
  );
};

export default FloatingActionButton;
