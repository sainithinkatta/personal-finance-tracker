import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Due } from "@/types/due";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle,
  Calendar,
  User,
} from "lucide-react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { cn } from "@/lib/utils";

interface TheyOweMeTabProps {
  dues: Due[];
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
  onMarkAsSettled: (id: string) => void;
}

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

const calculateTotals = (duesList: Due[]) => {
  return duesList.reduce((acc, due) => {
    if (!acc[due.currency]) {
      acc[due.currency] = 0;
    }
    acc[due.currency] += due.amount;
    return acc;
  }, {} as Record<string, number>);
};

const formatTotals = (totals: Record<string, number>) => {
  const entries = Object.entries(totals);
  if (entries.length === 0) return "$0.00";
  return entries
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" + ");
};

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

// Mobile Card Component
const MobileDueCard: React.FC<{
  due: Due;
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
  onMarkAsSettled: (id: string) => void;
}> = ({ due, onEdit, onDelete, onMarkAsSettled }) => {
  const overdue = isOverdue(due.due_date);

  return (
    <article
      className={cn(
        "bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      )}
    >
      <div className="p-4">
        <div className="flex gap-3">
          {/* Person Icon Section */}
          <div className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2 bg-accent-muted border-accent/20">
            <User className="h-7 w-7 text-accent" />
            <div className="text-xs font-bold mt-1 uppercase text-accent">
              Get
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Name and Amount Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground truncate">
                  {due.person_name}
                </h3>
              </div>
              <div className="text-xl font-bold whitespace-nowrap text-accent">
                {formatCurrency(due.amount, due.currency)}
              </div>
            </div>

            {/* Due Date Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {due.due_date && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg",
                    overdue
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(due.due_date), "MMM d, yyyy")}</span>
                  {overdue && <span className="font-bold">⚠</span>}
                </div>
              )}
            </div>

            {/* Notes */}
            {due.notes && (
              <div className="pt-1">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {due.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center border-t border-border bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 rounded-none hover:bg-emerald-50 flex items-center justify-center gap-2 touch-target transition-colors border-r border-border"
          onClick={() => onMarkAsSettled(due.id)}
        >
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-600">Settle</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 rounded-none hover:bg-primary/10 flex items-center justify-center gap-2 touch-target transition-colors border-r border-border"
          onClick={() => onEdit(due)}
        >
          <Edit2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 rounded-none hover:bg-destructive/10 flex items-center justify-center gap-2 touch-target transition-colors"
          onClick={() => onDelete(due.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Delete</span>
        </Button>
      </div>
    </article>
  );
};

export const TheyOweMeTab: React.FC<TheyOweMeTabProps> = ({
  dues,
  onEdit,
  onDelete,
  onMarkAsSettled,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingDueId, setDeletingDueId] = useState<string | null>(null);

  // Filter dues: type === "They Owe Me" && status === "Pending"
  const filteredDues = useMemo(() => {
    return dues
      .filter((due) => due.type === "They Owe Me" && due.status === "Pending")
      .filter((due) => {
        if (
          searchQuery &&
          !due.person_name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
  }, [dues, searchQuery]);

  // Sort by due date (most urgent first, overdue at top)
  const sortedDues = useMemo(() => {
    return [...filteredDues].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [filteredDues]);

  // Calculate stats
  const totals = calculateTotals(sortedDues);
  const overdueCount = sortedDues.filter((due) =>
    isOverdue(due.due_date)
  ).length;

  const handleDeleteClick = (id: string) => {
    setDeletingDueId(id);
  };

  const handleConfirmDelete = () => {
    if (deletingDueId) {
      onDelete(deletingDueId);
      setDeletingDueId(null);
    }
  };

  const dueToDelete = dues.find((due) => due.id === deletingDueId);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by person name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-lg border-slate-200 bg-white"
        />
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            {sortedDues.length} pending due{sortedDues.length !== 1 ? "s" : ""}
          </span>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-warning font-medium">
              <AlertTriangle className="h-4 w-4" />
              {overdueCount} overdue
            </span>
          )}
        </div>
        <span className="font-semibold text-accent">
          Total: {formatTotals(totals)}
        </span>
      </div>

      {/* Content */}
      {sortedDues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery ? "No results found" : "No pending receivables"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `No dues matching "${searchQuery}"`
              : "No one owes you money at the moment"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDues.map((due) => (
                  <TableRow key={due.id}>
                    <TableCell className="font-medium">
                      {due.person_name}
                    </TableCell>
                    <TableCell className="font-semibold text-accent">
                      {formatCurrency(due.amount, due.currency)}
                    </TableCell>
                    <TableCell>
                      {due.due_date ? (
                        <span
                          className={
                            isOverdue(due.due_date)
                              ? "text-warning font-semibold"
                              : ""
                          }
                        >
                          {format(new Date(due.due_date), "MMM d, yyyy")}
                          {isOverdue(due.due_date) && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs bg-warning/10 text-warning border-warning/30"
                            >
                              Overdue
                            </Badge>
                          )}
                        </span>
                      ) : (
                        "–"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {due.notes || "–"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onMarkAsSettled(due.id)}
                          title="Mark as Settled"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onEdit(due)}
                          title="Edit Due"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(due.id)}
                          title="Delete Due"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {sortedDues.map((due) => (
                  <MobileDueCard
                    key={due.id}
                    due={due}
                    onEdit={onEdit}
                    onDelete={handleDeleteClick}
                    onMarkAsSettled={onMarkAsSettled}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingDueId}
        onClose={() => setDeletingDueId(null)}
        onConfirm={handleConfirmDelete}
        entityName="Due"
        itemIdentifier={
          dueToDelete
            ? `${dueToDelete.person_name} (${formatCurrency(
                dueToDelete.amount,
                dueToDelete.currency
              )})`
            : undefined
        }
      />
    </div>
  );
};

export default TheyOweMeTab;
