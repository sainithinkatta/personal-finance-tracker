import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Due } from "@/types/due";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface DuesListProps {
  dues: Due[];
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
  onMarkAsSettled: (id: string) => void;
}

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "USD" ? "$" : "₹";
  return `${symbol}${amount.toFixed(2)}`;
};

const calculateTotals = (duesList: Due[]) => {
  return duesList
    .filter((due) => due.status === "Pending")
    .reduce<Record<string, number>>((acc, due) => {
      if (!acc[due.currency]) {
        acc[due.currency] = 0;
      }
      acc[due.currency] += due.amount;
      return acc;
    }, {});
};

const formatTotals = (totals: Record<string, number>) =>
  Object.entries(totals)
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" • ");

const DuesList: React.FC<DuesListProps> = ({ dues, onEdit, onDelete, onMarkAsSettled }) => {
  const [deletingDueId, setDeletingDueId] = useState<string | null>(null);

  const iOweDues = useMemo(() => dues.filter((due) => due.type === "I Owe"), [dues]);
  const theyOweMeDues = useMemo(() => dues.filter((due) => due.type === "They Owe Me"), [dues]);

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === "Settled") return false;
    return new Date(dueDate) < new Date();
  };

  const renderMobileList = (duesList: Due[]) => (
    <div className="space-y-3 md:hidden">
      {duesList.map((due) => {
        const overdue = isOverdue(due.due_date, due.status);
        return (
          <article
            key={due.id}
            className={`rounded-2xl border border-muted-foreground/20 bg-white p-3.5 shadow-sm ${
              overdue ? "border-l-4 border-l-red-400" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold text-foreground">{due.person_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {due.due_date ? format(new Date(due.due_date), "MMM d, yyyy") : "No due date"}
                </p>
                <p className="text-xs font-medium text-foreground">{formatCurrency(due.amount, due.currency)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                    due.status === "Settled" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {due.status}
                </Badge>
                <div className="flex items-center gap-1.5">
                  {due.status === "Pending" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50"
                      onClick={() => onMarkAsSettled(due.id)}
                      aria-label={`Mark ${due.person_name} as settled`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted/60"
                    onClick={() => onEdit(due)}
                    aria-label={`Edit due for ${due.person_name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingDueId(due.id)}
                    aria-label={`Delete due for ${due.person_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {due.notes && (
              <p className="mt-2 text-xs text-muted-foreground">{due.notes}</p>
            )}
          </article>
        );
      })}
    </div>
  );

  const renderDesktopTable = (duesList: Due[]) => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="text-sm font-semibold text-muted-foreground">Person</TableHead>
            <TableHead className="text-sm font-semibold text-muted-foreground">Amount</TableHead>
            <TableHead className="text-sm font-semibold text-muted-foreground">Due date</TableHead>
            <TableHead className="text-sm font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="text-sm font-semibold text-muted-foreground">Notes</TableHead>
            <TableHead className="text-right text-sm font-semibold text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {duesList.map((due) => (
            <TableRow key={due.id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{due.person_name}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(due.amount, due.currency)}
              </TableCell>
              <TableCell className={due.due_date && isOverdue(due.due_date, due.status) ? "text-red-600" : ""}>
                {due.due_date ? format(new Date(due.due_date), "MMM d, yyyy") : "–"}
              </TableCell>
              <TableCell>
                <Badge
                  className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                    due.status === "Settled" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {due.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {due.notes || "–"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  {due.status === "Pending" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50"
                      onClick={() => onMarkAsSettled(due.id)}
                      aria-label={`Mark ${due.person_name} as settled`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted/60"
                    onClick={() => onEdit(due)}
                    aria-label={`Edit due for ${due.person_name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingDueId(due.id)}
                    aria-label={`Delete due for ${due.person_name}`}
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
  );

  const dueToDelete = dues.find((due) => due.id === deletingDueId);

  return (
    <div className="space-y-6">
      {[{ label: "I Owe", data: iOweDues, accent: "text-red-600" }, { label: "They Owe Me", data: theyOweMeDues, accent: "text-emerald-600" }].map(
        ({ label, data, accent }) => {
          const totals = calculateTotals(data);
          return (
            <section key={label} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-foreground">{label}</h3>
                <span className={`text-sm font-semibold ${accent}`}>
                  {formatTotals(totals) || formatCurrency(0, "USD")}
                </span>
              </div>
              {data.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 py-6 text-center text-sm text-muted-foreground">
                  No dues found
                </div>
              ) : (
                <>
                  {renderMobileList(data)}
                  {renderDesktopTable(data)}
                </>
              )}
            </section>
          );
        }
      )}

      <AlertDialog open={!!deletingDueId} onOpenChange={() => setDeletingDueId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete due</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this due
              {dueToDelete
                ? ` for ${dueToDelete.person_name} (${formatCurrency(dueToDelete.amount, dueToDelete.currency)})`
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingDueId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingDueId) {
                  onDelete(deletingDueId);
                  setDeletingDueId(null);
                }
              }}
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

export default DuesList;
