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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CURRENCIES } from '@/types/expense';
import { useExpenses } from '@/hooks/useExpenses';
import { useIsMobile } from '@/hooks/use-mobile';
import ExpenseEditForm from '@/components/ExpenseEditForm';
import ExportDataButton from '@/components/ExportDataButton';

interface ExpenseListProps {
  expenses: Expense[];
  title?: string;
}

const ITEMS_PER_PAGE = 10;

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
  const isMobile = useIsMobile();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);

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
      
      // Reset to page 1 if current page becomes empty after deletion
      const newTotalPages = Math.ceil((expenses.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const expenseToDelete = expenses.find(e => e.id === deletingExpenseId);

  return (
    <div className="p-3 sm:p-6 pt-0">
      <div className="flex items-center justify-between pt-2 pb-3 gap-2">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
        <ExportDataButton expenses={expenses} />
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
                    {currentExpenses.map((expense, index) => (
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

            {/* Mobile Card View */}
            <div className="block md:hidden">
              <ScrollArea className="h-[60vh] max-h-[500px]">
                <div className="space-y-3 pb-20">
                  {currentExpenses.map((expense) => (
                    <article
                      key={expense.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Main Content */}
                      <div className="p-4">
                        <div className="flex gap-3">
                          {/* Date Section - Calendar Style */}
                          <div className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="text-2xl font-bold text-gray-900 leading-none">
                              {format(expense.date, 'dd')}
                            </div>
                            <div className="text-xs font-semibold text-blue-700 uppercase mt-0.5">
                              {format(expense.date, 'MMM')}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">
                              {format(expense.date, 'EEE')}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            {/* Amount and Category Row */}
                            <div className="flex items-start justify-between gap-2">
                              <Badge
                                className={cn(
                                  'font-semibold text-xs px-3 py-1 rounded-lg',
                                  getCategoryColor(expense.category)
                                )}
                              >
                                {expense.category}
                              </Badge>
                              <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
                                {formatCurrency(expense.amount, expense.currency)}
                              </div>
                            </div>

                            {/* Description */}
                            {expense.description ? (
                              <div className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                                {expense.description}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic">
                                No description
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex items-center border-t border-gray-100 bg-gray-50/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-11 rounded-none hover:bg-blue-50 flex items-center justify-center gap-2 touch-target transition-colors border-r border-gray-100"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-11 rounded-none hover:bg-red-50 flex items-center justify-center gap-2 touch-target transition-colors"
                          onClick={() => setDeletingExpenseId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Delete</span>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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

      {/* Edit Expense - Bottom Sheet on Mobile, Dialog on Desktop */}
      {isMobile ? (
        <BottomSheet open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>Edit Expense</BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              {editingExpense && (
                <ExpenseEditForm
                  expense={editingExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onClose={() => setEditingExpense(null)}
                />
              )}
            </BottomSheetBody>
          </BottomSheetContent>
        </BottomSheet>
      ) : (
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
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent className="mx-auto w-[calc(100%-2rem)] sm:w-full">
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