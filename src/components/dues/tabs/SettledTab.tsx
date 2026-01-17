import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Due } from "@/types/due";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CheckCircle2, Edit2, Trash2, Calendar, User } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { cn } from "@/lib/utils";

interface SettledTabProps {
  dues: Due[];
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
}

type TypeFilter = "all" | "I Owe" | "They Owe Me";

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

// Mobile Card Component for Settled Dues
const MobileSettledCard: React.FC<{
  due: Due;
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
}> = ({ due, onEdit, onDelete }) => {
  const isIOwe = due.type === "I Owe";

  return (
    <article
      className={cn(
        "bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden opacity-70"
      )}
    >
      <div className="p-4">
        <div className="flex gap-3">
          {/* Person Icon Section */}
          <div
            className={cn(
              "flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2",
              isIOwe
                ? "bg-destructive/10 border-destructive/20"
                : "bg-accent-muted border-accent/20"
            )}
          >
            <User
              className={cn(
                "h-7 w-7",
                isIOwe ? "text-destructive" : "text-accent"
              )}
            />
            <div
              className={cn(
                "text-xs font-bold mt-1 uppercase",
                isIOwe ? "text-destructive" : "text-accent"
              )}
            >
              {isIOwe ? "Owe" : "Get"}
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
              <div
                className={cn(
                  "text-xl font-bold whitespace-nowrap",
                  isIOwe ? "text-destructive" : "text-accent"
                )}
              >
                {formatCurrency(due.amount, due.currency)}
              </div>
            </div>

            {/* Status and Settled Date */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="bg-accent-muted text-accent-foreground font-semibold text-xs px-2.5 py-1 rounded-lg"
              >
                Settled
              </Badge>

              {due.settled_date && (
                <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(due.settled_date), "MMM d, yyyy")}
                  </span>
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

export const SettledTab: React.FC<SettledTabProps> = ({
  dues,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [deletingDueId, setDeletingDueId] = useState<string | null>(null);

  // Filter dues: status === "Settled"
  const filteredDues = useMemo(() => {
    return dues
      .filter((due) => due.status === "Settled")
      .filter((due) => {
        // Type filter
        if (typeFilter !== "all" && due.type !== typeFilter) {
          return false;
        }
        // Search filter
        if (
          searchQuery &&
          !due.person_name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
  }, [dues, searchQuery, typeFilter]);

  // Sort by settled date (most recent first)
  const sortedDues = useMemo(() => {
    return [...filteredDues].sort((a, b) => {
      // Items without settled dates go to the end
      if (!a.settled_date && !b.settled_date) return 0;
      if (!a.settled_date) return 1;
      if (!b.settled_date) return -1;
      return (
        new Date(b.settled_date).getTime() - new Date(a.settled_date).getTime()
      );
    });
  }, [filteredDues]);

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
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by person name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-lg border-slate-200 bg-white"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(value: TypeFilter) => setTypeFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-lg border-slate-200 bg-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="I Owe">I Owe</SelectItem>
            <SelectItem value="They Owe Me">They Owe Me</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {sortedDues.length} settled due{sortedDues.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      {sortedDues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery || typeFilter !== "all"
              ? "No results found"
              : "No settled dues"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Settled dues will appear here"}
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
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Settled Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDues.map((due) => (
                  <TableRow key={due.id} className="opacity-70">
                    <TableCell className="font-medium">
                      {due.person_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          due.type === "I Owe"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-accent-muted text-accent border-accent/20"
                        )}
                      >
                        {due.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-semibold",
                        due.type === "I Owe" ? "text-destructive" : "text-accent"
                      )}
                    >
                      {formatCurrency(due.amount, due.currency)}
                    </TableCell>
                    <TableCell>
                      {due.settled_date
                        ? format(new Date(due.settled_date), "MMM d, yyyy")
                        : "–"}
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
                  <MobileSettledCard
                    key={due.id}
                    due={due}
                    onEdit={onEdit}
                    onDelete={handleDeleteClick}
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

export default SettledTab;
