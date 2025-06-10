
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { Expense } from '@/types/expense';
import { cn } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { CURRENCIES } from '@/types/expense';
import { useExpenses } from '@/hooks/useExpenses';
import ExpenseEditForm from '@/components/ExpenseEditForm';

interface ExpenseListProps {
  expenses: Expense[];
  title?: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Groceries':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'Food':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'Travel':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'Bills':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'Others':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const formatCurrency = (amount: number, currency: string) => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
};

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  title = 'Recent Expenses',
}) => {
  const { updateExpense, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = (id: string, updatedData: Partial<Expense>) => {
    updateExpense({ id, data: updatedData });
    setEditingExpense(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingExpenseId) {
      deleteExpense(deletingExpenseId);
      setDeletingExpenseId(null);
    }
  };

  const expenseToDelete = expenses.find(e => e.id === deletingExpenseId);

  return (
    <div className="p-6 pt-0">
      <div className="text-sm text-muted-foreground pt-2 pb-4">
        {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} found
      </div>

      <div>
        {expenses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-semibold text-gray-700">
                        Date & Day
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense, index) => (
                      <TableRow
                        key={expense.id}
                        className={cn(
                          'hover:bg-gray-50',
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {format(expense.date, 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(expense.date, 'EEEE')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'font-normal',
                              getCategoryColor(expense.category)
                            )}
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {expense.description || '–'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(expense.amount, expense.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              onClick={() => setDeletingExpenseId(expense.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            <div className="flex justify-end mt-4">
              <div className="flex space-x-2 text-sm text-gray-500">
                <button className="hover:text-gray-700">‹ Previous</button>
                <span className="mx-2">1 of 1</span>
                <button className="hover:text-gray-700">Next ›</button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">
              No expenses found for the selected filters.
            </p>
            <p className="text-sm mb-4">
              Try adjusting your date range or category selection.
            </p>
          </div>
        )}
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseEditForm
              expense={editingExpense}
              onUpdateExpense={handleUpdateExpense}
              onClose={() => setEditingExpense(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense{expenseToDelete ? ` for ${formatCurrency(expenseToDelete.amount, expenseToDelete.currency)}` : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingExpenseId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpenseList;
