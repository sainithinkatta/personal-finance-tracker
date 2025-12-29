import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';
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
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CURRENCIES } from '@/types/expense';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BankAccount } from '@/types/bankAccount';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ExpenseEditForm from '@/components/ExpenseEditForm';
import EmptyState from '@/components/dashboard/EmptyState';
import { useTransactions } from '@/hooks/useTransactions';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  bankAccounts: BankAccount[];
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
    case 'Income':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
    default:
      return 'bg-muted text-muted-foreground hover:bg-muted/80';
  }
};

const formatCurrency = (amount: number, currency: string) => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencyInfo?.symbol || currency}${absAmount.toFixed(2)}`;
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = 'Transactions',
  bankAccounts,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { deleteTransaction } = useTransactions();
  
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to apply balance changes to bank accounts
  const applyBalanceChange = async (accountId: string, delta: number) => {
    const { data: acct, error: fetchErr } = await supabase
      .from('bank_accounts')
      .select('balance, available_balance, account_type, due_balance')
      .eq('id', accountId)
      .single();
    if (fetchErr || !acct) throw fetchErr ?? new Error('Account not found');

    const isCredit = acct.account_type?.toLowerCase() === 'credit';
    const now = new Date().toISOString();
    const updates: Partial<BankAccount> = { updated_at: now };

    if (isCredit) {
      const currAvail = acct.available_balance ?? acct.balance;
      updates.available_balance = currAvail + delta;
      updates.balance = acct.balance + delta;
      updates.due_balance = (acct.due_balance ?? 0) - delta;
    } else {
      updates.balance = acct.balance + delta;
    }

    const { error: updErr } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', accountId);
    if (updErr) throw updErr;
  };

  // Update expense mutation
  const updateExpenseMutation = useMutation<void, unknown, { id: string; data: Partial<Expense> }>({
    mutationFn: async ({ id, data }) => {
      const { data: oldExp, error: oldErr } = await supabase
        .from('expenses')
        .select('amount, bank_account_id')
        .eq('id', id)
        .single();
      if (oldErr || !oldExp) throw oldErr;

      // Patch the expense record
      const payload: Record<string, unknown> = {};
      if (data.amount != null) payload.amount = data.amount;
      if (data.date) payload.date = format(data.date, 'yyyy-MM-dd');
      if (data.category) payload.category = data.category;
      if (data.description !== undefined) payload.description = data.description;
      if (data.currency) payload.currency = data.currency;
      if (data.bank_account_id !== undefined) payload.bank_account_id = data.bank_account_id;
      if (data.budget_id !== undefined) payload.budget_id = data.budget_id;

      const { error: updErr } = await supabase.from('expenses').update(payload).eq('id', id);
      if (updErr) throw updErr;

      // Restore the old amount
      if (oldExp.bank_account_id) {
        await applyBalanceChange(oldExp.bank_account_id, oldExp.amount);
      }
      // Subtract the new amount
      const newAmt = data.amount ?? oldExp.amount;
      if (data.bank_account_id) {
        await applyBalanceChange(data.bank_account_id, -newAmt);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Expense Updated', description: 'Updated successfully.' });
    },
    onError: () =>
      toast({ title: 'Error', description: 'Failed to update expense.', variant: 'destructive' }),
  });

  const updateExpense = updateExpenseMutation.mutate;

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const handleEditTransaction = (tx: Transaction) => {
    // Only allow editing expenses, not income
    if (tx.type === 'expense') {
      const expense: Expense = {
        id: tx.sourceId,
        date: tx.date,
        amount: tx.amount,
        category: tx.category as Expense['category'],
        description: tx.description,
        currency: tx.currency,
        bank_account_id: tx.bank_account_id,
        budget_id: tx.budget_id,
      };
      setEditingExpense(expense);
    }
  };

  const handleUpdateExpense = (id: string, updatedData: Partial<Expense>) => {
    updateExpense({ id, data: updatedData });
    setEditingExpense(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction);
      setDeletingTransaction(null);

      // Reset to page 1 if current page becomes empty after deletion
      const newTotalPages = Math.ceil((transactions.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-3 sm:p-6 pt-0">
      <div className="flex items-center pt-2 pb-3">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
        </div>
      </div>

      <div>
        {transactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">
                        Date & Day
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Bank
                      </TableHead>
                      <TableHead className="font-semibold text-foreground text-right">
                        Amount
                      </TableHead>
                      <TableHead className="font-semibold text-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.map((tx, index) => {
                      const isIncome = tx.type === 'income';
                      return (
                        <TableRow
                          key={tx.id}
                          className={cn(
                            'hover:bg-muted/30 transition-colors',
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                          )}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {format(tx.date, 'MMM d, yyyy')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(tx.date, 'EEEE')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'font-normal',
                                getCategoryColor(tx.category)
                              )}
                            >
                              {tx.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {tx.description || '–'}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-muted-foreground">
                            {bankAccounts.find(b => b.id === tx.bank_account_id)?.name || '–'}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-semibold",
                            isIncome ? "text-emerald-600" : "text-foreground"
                          )}>
                            {formatCurrency(tx.amount, tx.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {!isIncome && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditTransaction(tx)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeletingTransaction(tx)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
              <ScrollArea className="h-[60vh] max-h-[500px]">
                <div className="space-y-3 pb-20">
                  {currentTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <article
                        key={tx.id}
                        className={cn(
                          "rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
                          isIncome ? "bg-emerald-50/50 border-emerald-200" : "bg-card"
                        )}
                      >
                        {/* Main Content */}
                        <div className="p-4">
                          <div className="flex gap-3">
                            {/* Date Section - Calendar Style */}
                            <div className={cn(
                              "flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-xl border",
                              isIncome 
                                ? "bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200" 
                                : "bg-gradient-to-br from-info-muted to-info-muted/50 border-info/20"
                            )}>
                              <div className="text-2xl font-bold text-foreground leading-none">
                                {format(tx.date, 'dd')}
                              </div>
                              <div className={cn(
                                "text-xs font-semibold uppercase mt-0.5",
                                isIncome ? "text-emerald-700" : "text-info-foreground"
                              )}>
                                {format(tx.date, 'MMM')}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {format(tx.date, 'EEE')}
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              {/* Amount and Category Row */}
                              <div className="flex items-start justify-between gap-2">
                                <Badge
                                  className={cn(
                                    'font-semibold text-xs px-3 py-1 rounded-lg',
                                    getCategoryColor(tx.category)
                                  )}
                                >
                                  {tx.category}
                                </Badge>
                                <div className={cn(
                                  "text-xl font-bold whitespace-nowrap",
                                  isIncome ? "text-emerald-600" : "text-foreground"
                                )}>
                                  {formatCurrency(tx.amount, tx.currency)}
                                </div>
                              </div>

                              {/* Description */}
                              {tx.description ? (
                                <div className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                                  {tx.description}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground italic">
                                  No description
                                </div>
                              )}

                              {/* Bank Account */}
                              <div className="text-xs text-muted-foreground">
                                Bank: {bankAccounts.find(b => b.id === tx.bank_account_id)?.name || '–'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div className={cn(
                          "flex items-center border-t",
                          isIncome ? "bg-emerald-100/50 border-emerald-200" : "bg-muted/30"
                        )}>
                          {!isIncome && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-11 rounded-none hover:bg-primary/10 flex items-center justify-center gap-2 touch-target transition-colors border-r"
                              onClick={() => handleEditTransaction(tx)}
                            >
                              <Edit2 className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Edit</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-11 rounded-none hover:bg-destructive/10 flex items-center justify-center gap-2 touch-target transition-colors",
                              isIncome ? "flex-1" : "flex-1"
                            )}
                            onClick={() => setDeletingTransaction(tx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium text-destructive">Delete</span>
                          </Button>
                        </div>
                      </article>
                    );
                  })}
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
                        className={cn(
                          currentPage === 1 && 'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={cn(
                          currentPage === totalPages && 'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No transactions"
            description="Your transactions will appear here"
          />
        )}

        {/* Edit Dialog - Only for expenses */}
        {editingExpense && (
          isMobile ? (
            <BottomSheet open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
              <BottomSheetContent>
                <BottomSheetHeader>
                  <BottomSheetTitle>Edit Expense</BottomSheetTitle>
                </BottomSheetHeader>
                <BottomSheetBody>
                  <ExpenseEditForm
                    expense={editingExpense}
                    onUpdateExpense={(id, data) => handleUpdateExpense(id, data)}
                    onClose={() => setEditingExpense(null)}
                    bankAccounts={bankAccounts}
                  />
                </BottomSheetBody>
              </BottomSheetContent>
            </BottomSheet>
          ) : (
            <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Expense</DialogTitle>
                </DialogHeader>
                <ExpenseEditForm
                  expense={editingExpense}
                  onUpdateExpense={(id, data) => handleUpdateExpense(id, data)}
                  onClose={() => setEditingExpense(null)}
                  bankAccounts={bankAccounts}
                />
              </DialogContent>
            </Dialog>
          )
        )}

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          isOpen={!!deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirm={handleDeleteConfirm}
          entityName={deletingTransaction?.type === 'income' ? 'Income' : 'Expense'}
          itemIdentifier={deletingTransaction?.description || formatCurrency(Math.abs(deletingTransaction?.amount || 0), deletingTransaction?.currency || 'USD')}
          additionalInfo={deletingTransaction?.type === 'income' 
            ? 'This will subtract the amount from your bank balance.'
            : 'This will restore the amount to your bank balance.'}
        />
      </div>
    </div>
  );
};

export default React.memo(TransactionList);
