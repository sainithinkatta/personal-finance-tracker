
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BudgetManagerHeader from '@/components/budget/BudgetManagerHeader';
import { BudgetGrid } from '@/components/budget/BudgetGrid';
import { BudgetEmptyState } from '@/components/budget/BudgetEmptyState';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { DeleteBudgetDialog } from '@/components/budget/DeleteBudgetDialog';
import { CategoryAllocationForm } from '@/components/budget/CategoryAllocationForm';
import { useBudgets } from '@/hooks/useBudgets';
import { Budget } from '@/types/budget';

const BudgetManager: React.FC = () => {
  const handleBudgetCreated = (budget: Budget) => {
    // Auto-open allocation modal for newly created budget
    setAllocatingBudget(budget);
  };

  const { 
    budgets, 
    isLoading, 
    createBudget, 
    updateBudget, 
    deleteBudget, 
    updateCategoryAllocations,
    isCreating, 
    isUpdating, 
    isDeleting,
    isUpdatingAllocations
  } = useBudgets(handleBudgetCreated);

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [allocatingBudget, setAllocatingBudget] = useState<Budget | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading budgets...</div>
      </div>
    );
  }

  const handleAddBudget = () => {
    setShowCreateForm(true);
  };

  const handleCreateBudget = (budgetData: Partial<Budget>) => {
    // Ensure all required fields are present
    const budgetToCreate = {
      name: budgetData.name || '',
      total_amount: budgetData.total_amount || 0,
      month: budgetData.month || new Date().getMonth() + 1,
      year: budgetData.year || new Date().getFullYear(),
      currency: budgetData.currency || 'USD',
      notes: budgetData.notes || null,
    };
    
    createBudget(budgetToCreate);
    setShowCreateForm(false);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
  };

  const handleUpdateBudget = (budgetData: Partial<Budget>) => {
    if (editingBudget) {
      updateBudget({ id: editingBudget.id, updates: budgetData });
      setEditingBudget(null);
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    setDeletingBudget(budget);
  };

  const handleConfirmDelete = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
    }
  };

  const handleAllocateBudget = (budget: Budget) => {
    setAllocatingBudget(budget);
  };

  const handleSaveAllocations = async (allocations: any) => {
    if (allocatingBudget) {
      try {
        await updateCategoryAllocations({ 
          id: allocatingBudget.id, 
          allocations 
        });
        setAllocatingBudget(null);
      } catch (error) {
        console.error('Failed to save allocations:', error);
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <BudgetManagerHeader onAddBudget={handleAddBudget} />
        <Card>
          <CardContent className="p-6">
            {budgets.length === 0 ? (
              <BudgetEmptyState />
            ) : (
              <BudgetGrid 
                budgets={budgets} 
                onEdit={handleEditBudget}
                onAllocate={handleAllocateBudget}
                onDelete={handleDeleteBudget}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Budget Form */}
      <BudgetForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateBudget}
        isLoading={isCreating}
      />

      {/* Edit Budget Form */}
      <BudgetForm
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        onSave={handleUpdateBudget}
        budget={editingBudget}
        isLoading={isUpdating}
      />

      {/* Delete Budget Dialog */}
      <DeleteBudgetDialog
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleConfirmDelete}
        budget={deletingBudget}
        isLoading={isDeleting}
      />

      {/* Category Allocation Form */}
      <CategoryAllocationForm
        isOpen={!!allocatingBudget}
        onClose={() => setAllocatingBudget(null)}
        onSave={handleSaveAllocations}
        budget={allocatingBudget}
        isLoading={isUpdatingAllocations}
      />
    </>
  );
};

export default BudgetManager;
