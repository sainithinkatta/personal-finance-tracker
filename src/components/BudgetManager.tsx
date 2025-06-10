
import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { Budget } from '@/types/budget';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { CategoryAllocationForm } from '@/components/budget/CategoryAllocationForm';
import { DeleteBudgetDialog } from '@/components/budget/DeleteBudgetDialog';
import { BudgetManagerHeader } from '@/components/budget/BudgetManagerHeader';
import { BudgetEmptyState } from '@/components/budget/BudgetEmptyState';
import { BudgetGrid } from '@/components/budget/BudgetGrid';

const BudgetManager = () => {
  const { 
    budgets, 
    isLoading: budgetsLoading, 
    createBudget, 
    updateBudget, 
    updateCategoryAllocations,
    deleteBudget, 
    isCreating, 
    isUpdating, 
    isUpdatingAllocations,
    isDeleting 
  } = useBudgets();
  
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [allocatingBudget, setAllocatingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [pendingAllocationBudgetData, setPendingAllocationBudgetData] = useState<Partial<Budget> | null>(null);

  const handleCreateBudget = (budgetData: Partial<Budget>) => {
    // Store the budget data to find it after creation
    setPendingAllocationBudgetData(budgetData);
    createBudget(budgetData as Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    setShowBudgetForm(false);
  };

  // Effect to handle opening allocation form after budget creation
  React.useEffect(() => {
    if (pendingAllocationBudgetData && budgets.length > 0) {
      // Find the newly created budget by matching the stored data
      const newBudget = budgets.find(budget => 
        budget.name === pendingAllocationBudgetData.name &&
        budget.total_amount === pendingAllocationBudgetData.total_amount &&
        budget.month === pendingAllocationBudgetData.month &&
        budget.year === pendingAllocationBudgetData.year
      );
      
      if (newBudget) {
        setAllocatingBudget(newBudget);
        setShowAllocationForm(true);
        setPendingAllocationBudgetData(null); // Clear the pending data
      }
    }
  }, [budgets, pendingAllocationBudgetData]);

  const handleUpdateBudget = (budgetData: Partial<Budget>) => {
    if (editingBudget) {
      updateBudget({ id: editingBudget.id, updates: budgetData });
      setEditingBudget(null);
      setShowBudgetForm(false);
    }
  };

  const handleSaveAllocations = (allocations: any) => {
    if (allocatingBudget) {
      updateCategoryAllocations({ id: allocatingBudget.id, allocations });
      setAllocatingBudget(null);
      setShowAllocationForm(false);
    }
  };

  const handleDeleteBudget = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowBudgetForm(true);
  };

  const handleAllocateBudget = (budget: Budget) => {
    setAllocatingBudget(budget);
    setShowAllocationForm(true);
  };

  const handleAddBudget = () => {
    setShowBudgetForm(true);
  };

  const handleCancelForm = () => {
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const handleCancelAllocationForm = () => {
    setShowAllocationForm(false);
    setAllocatingBudget(null);
    setPendingAllocationBudgetData(null); // Also clear pending data if user cancels
  };

  if (budgetsLoading) {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className="space-y-6">
      <BudgetManagerHeader onAddBudget={handleAddBudget} />

      {budgets.length === 0 ? (
        <BudgetEmptyState onAddBudget={handleAddBudget} />
      ) : (
        <BudgetGrid
          budgets={budgets}
          onEdit={handleEditBudget}
          onAllocate={handleAllocateBudget}
          onDelete={(budget) => setDeletingBudget(budget)}
        />
      )}

      <BudgetForm
        isOpen={showBudgetForm}
        onClose={handleCancelForm}
        onSave={editingBudget ? handleUpdateBudget : handleCreateBudget}
        budget={editingBudget}
        isLoading={isCreating || isUpdating}
      />

      {allocatingBudget && (
        <CategoryAllocationForm
          isOpen={showAllocationForm}
          onClose={handleCancelAllocationForm}
          onSave={handleSaveAllocations}
          budget={allocatingBudget}
          isLoading={isUpdatingAllocations}
        />
      )}

      <DeleteBudgetDialog
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteBudget}
        budget={deletingBudget}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BudgetManager;
