
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpenseForm from "@/components/ExpenseForm";
import { useExpenses } from "@/hooks/useExpenses";
import { ResponsiveSheet } from "@/components/layout/ResponsiveSheet";

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addExpense } = useExpenses();
  const formId = "add-expense-form";

  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+16px)] z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg transition-transform duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Add new expense"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ResponsiveSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Add Expense"
        description="Quickly track a new expense and keep your budget in sync."
        footer={(
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={formId}
              className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Add Expense
            </button>
          </div>
        )}
        contentClassName="pb-24"
      >
        <ExpenseForm
          onAddExpense={handleAddExpense}
          onClose={() => setIsOpen(false)}
          hideSubmit
          formId={formId}
        />
      </ResponsiveSheet>
    </>
  );
};

export default FloatingActionButton;
