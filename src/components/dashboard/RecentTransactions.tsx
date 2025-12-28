import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { CURRENCIES } from '@/types/expense';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BankAccount } from '@/types/bankAccount';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import ExpenseEditForm from '@/components/ExpenseEditForm';

interface RecentTransactionsProps {
  expenses: Expense[];
  bankAccounts: BankAccount[];
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Groceries':
      return 'bg-emerald-500';
    case 'Food':
      return 'bg-orange-500';
    case 'Travel':
      return 'bg-blue-500';
    case 'Bills':
      return 'bg-red-500';
    case 'Others':
      return 'bg-purple-500';
    default:
      return 'bg-muted-foreground';
  }
};

const formatCurrency = (amount: number, currency: string) => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
};

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  expenses,
  bankAccounts,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Get last 5 expenses sorted by date
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      // Convert Date to string for Supabase
      const dbUpdates = {
        ...updates,
        date: updates.date instanceof Date
          ? updates.date.toISOString().split('T')[0]
          : updates.date,
      };

      const { error } = await supabase
        .from('expenses')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: 'Expense Updated',
        description: 'The expense has been updated successfully.',
      });
      setEditingExpense(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: 'Expense Deleted',
        description: 'The expense has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleUpdate = (id: string, updates: Partial<Expense>) => {
    updateMutation.mutate({ id, updates });
    setEditingExpense(null);
  };

  const handleDelete = () => {
    if (deletingExpenseId) {
      deleteMutation.mutate(deletingExpenseId);
      setDeletingExpenseId(null);
    }
  };

  return (
    <>
      <Card className="bg-card border border-border/60 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 border-b border-border/30">
          <CardTitle className="text-base font-semibold text-foreground" style={{ color: '#3b82f6' }}>
            Recent Transactions
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            </div>
          ) : (
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Main Content */}
                <div className="flex items-center gap-3 p-3">
                  {/* Date Box */}
                  <div className="flex flex-col items-center justify-center px-2.5 py-2 bg-amber-50 rounded-lg min-w-[50px] shrink-0">
                    <div className="text-lg font-bold text-foreground leading-none">
                      {format(new Date(expense.date), 'dd')}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-0.5 font-medium">
                      {format(new Date(expense.date), 'MMM')}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">
                      {format(new Date(expense.date), 'EEE')}
                    </div>
                  </div>

                  {/* Category & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${getCategoryColor(expense.category)}`} />
                      <span className="text-sm font-semibold text-foreground">
                        {expense.category}
                      </span>
                      <span className="text-sm font-bold text-foreground ml-auto shrink-0">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate pl-4">
                      {expense.description || expense.category}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex border-t border-border">
                  <Button
                    variant="ghost"
                    className="flex-1 h-9 rounded-none text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 border-r border-border"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 h-9 rounded-none text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/50"
                    onClick={() => setDeletingExpenseId(expense.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog/Sheet */}
      {isMobile ? (
        <BottomSheet open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>Edit Expense</BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              {editingExpense && (
                <ExpenseEditForm
                  expense={editingExpense}
                  onUpdateExpense={handleUpdate}
                  onClose={() => setEditingExpense(null)}
                  bankAccounts={bankAccounts}
                />
              )}
            </BottomSheetBody>
          </BottomSheetContent>
        </BottomSheet>
      ) : (
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            {editingExpense && (
              <ExpenseEditForm
                expense={editingExpense}
                onUpdateExpense={handleUpdate}
                onClose={() => setEditingExpense(null)}
                bankAccounts={bankAccounts}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingExpenseId}
        onClose={() => setDeletingExpenseId(null)}
        onConfirm={handleDelete}
        entityName="Expense"
      />
    </>
  );
};
