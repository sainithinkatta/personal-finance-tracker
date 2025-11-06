import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { Expense, CURRENCIES } from "@/types/expense";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExportDataButton from "@/components/ExportDataButton";
import ExpenseEditForm from "@/components/ExpenseEditForm";
import { useExpenses } from "@/hooks/useExpenses";
import { ResponsiveSheet } from "@/components/layout/ResponsiveSheet";

interface ExpenseListProps {
  expenses: Expense[];
  summaryChips?: string[];
}

const ITEMS_PER_PAGE = 10;

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Groceries":
      return "bg-green-100 text-green-800";
    case "Food":
      return "bg-orange-100 text-orange-800";
    case "Travel":
      return "bg-blue-100 text-blue-800";
    case "Bills":
      return "bg-red-100 text-red-800";
    case "Others":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatCurrency = (amount: number, currency: string) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, summaryChips = [] }) => {
  const { updateExpense, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);
  const editFormId = "edit-expense-form";

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = (id: string, updatedData: Partial<Expense>) => {
    updateExpense({ id, data: updatedData });
    setEditingExpense(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingExpenseId) return;
    deleteExpense(deletingExpenseId);
    setDeletingExpenseId(null);
    const newTotalPages = Math.ceil((expenses.length - 1) / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const expenseToDelete = useMemo(
    () => expenses.find((expense) => expense.id === deletingExpenseId),
    [deletingExpenseId, expenses]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {expenses.length === 0 ? 0 : startIndex + 1}-
          {Math.min(endIndex, expenses.length)} of {expenses.length}{" "}
          {expenses.length === 1 ? "expense" : "expenses"}
        </div>
        <div className="md:hidden">
          <ExportDataButton
            expenses={expenses}
            buttonVariant="secondary"
            buttonSize="default"
            className="h-11 rounded-xl"
            fullWidth
          />
        </div>
        <div className="hidden md:block">
          <ExportDataButton expenses={expenses} />
        </div>
      </div>

      {summaryChips.length > 0 && (
        <div className="flex flex-wrap gap-2 md:hidden">
          {summaryChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-full border border-muted-foreground/20 bg-muted/60 px-3 py-1 text-xs text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {expenses.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {currentExpenses.map((expense) => (
              <article
                key={expense.id}
                className="rounded-2xl border border-muted-foreground/20 bg-white p-3.5 shadow-sm"
              >
                <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
                  <div className="min-w-[60px] text-xs text-muted-foreground">
                    <p className="text-sm font-semibold text-foreground">
                      {format(expense.date, "MMM d")}
                    </p>
                    <p>{format(expense.date, "EEE")}</p>
                    <span
                      className={cn(
                        "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        getCategoryColor(expense.category)
                      )}
                    >
                      {expense.category}
                    </span>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-base font-medium text-foreground">
                      {expense.description || "No description"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(expense.date, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(expense.amount, expense.currency)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded-full border border-muted-foreground/20 p-2.5 text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Manage ${expense.description || "expense"}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-sm">
                        <DropdownMenuItem onSelect={() => handleEditExpense(expense)}>
                          Edit expense
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeletingExpenseId(expense.id)}
                        >
                          Delete expense
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold text-muted-foreground">
                    Date & Day
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentExpenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className={cn(
                      "hover:bg-muted/40",
                      index % 2 === 0 ? "bg-white" : "bg-muted/20"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {format(expense.date, "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(expense.date, "EEEE")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "font-normal text-xs",
                          getCategoryColor(expense.category)
                        )}
                      >
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {expense.description || "–"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => handleEditExpense(expense)}
                          aria-label={`Edit ${expense.description || "expense"}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive"
                          onClick={() => setDeletingExpenseId(expense.id)}
                          aria-label={`Delete ${expense.description || "expense"}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 py-12 text-center">
          <p className="text-base font-medium text-foreground">No expenses yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add a new expense to get started.
          </p>
        </div>
      )}

      <ResponsiveSheet
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null);
          }
        }}
        title="Edit Expense"
        description="Update the details for this transaction."
        footer={(
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={editFormId}
              className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Update Expense
            </button>
          </div>
        )}
        contentClassName="pb-24"
      >
        {editingExpense ? (
          <ExpenseEditForm
            expense={editingExpense}
            onUpdateExpense={handleUpdateExpense}
            onClose={() => setEditingExpense(null)}
            hideActions
            formId={editFormId}
          />
        ) : null}
      </ResponsiveSheet>

      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense
              {expenseToDelete
                ? ` for ${formatCurrency(expenseToDelete.amount, expenseToDelete.currency)}`
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingExpenseId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
