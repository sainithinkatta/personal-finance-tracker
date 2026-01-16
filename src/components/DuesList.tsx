import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, CheckCircle, Calendar, User } from 'lucide-react';
import { Due } from '@/types/due';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface DuesListProps {
  dues: Due[];
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
  onMarkAsSettled: (id: string) => void;
}

const DuesList: React.FC<DuesListProps> = ({ dues, onEdit, onDelete, onMarkAsSettled }) => {
  const [deletingDueId, setDeletingDueId] = useState<string | null>(null);

  const iOweDues = dues.filter(due => due.type === 'I Owe');
  const theyOweMeDues = dues.filter(due => due.type === 'They Owe Me');

  const calculateTotal = (duesList: Due[]) => {
    const totals = duesList
      .filter(due => due.status === 'Pending')
      .reduce((acc, due) => {
        if (!acc[due.currency]) {
          acc[due.currency] = 0;
        }
        acc[due.currency] += due.amount;
        return acc;
      }, {} as Record<string, number>);

    return totals;
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${formatAmount(amount)}`;
  };

  const formatTotals = (totals: Record<string, number>) => {
    return Object.entries(totals)
      .map(([currency, amount]) => formatCurrency(amount, currency))
      .join(' + ');
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Mobile Card View Component
  const renderMobileCard = (due: Due, colorClass: string) => (
    <article
      key={due.id}
      className={cn(
        "bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        due.status === 'Settled' && 'opacity-60'
      )}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Person Icon Section */}
          <div className={cn(
            "flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2",
            colorClass === 'text-destructive' ? 'bg-destructive/10 border-destructive/20' : 'bg-accent-muted border-accent/20'
          )}>
            <User className={cn(
              "h-7 w-7",
              colorClass === 'text-destructive' ? 'text-destructive' : 'text-accent'
            )} />
            <div className={cn(
              "text-xs font-bold mt-1 uppercase",
              colorClass === 'text-destructive' ? 'text-destructive' : 'text-accent'
            )}>
              {due.type === 'I Owe' ? 'Owe' : 'Get'}
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
              <div className={cn(
                "text-xl font-bold whitespace-nowrap",
                colorClass
              )}>
                {formatCurrency(due.amount, due.currency)}
              </div>
            </div>

            {/* Status and Due Date Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={due.status === 'Settled' ? 'secondary' : 'default'}
                className={cn(
                  'font-semibold text-xs px-2.5 py-1 rounded-lg',
                  due.status === 'Settled' && 'bg-accent-muted text-accent-foreground'
                )}
              >
                {due.status}
              </Badge>

              {due.due_date && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg",
                  isOverdue(due.due_date) && due.status === 'Pending'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(due.due_date), 'MMM d, yyyy')}</span>
                  {isOverdue(due.due_date) && due.status === 'Pending' && (
                    <span className="font-bold">⚠</span>
                  )}
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
        {due.status === 'Pending' && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-11 rounded-none hover:bg-accent/10 flex items-center justify-center gap-2 touch-target transition-colors border-r border-border"
            onClick={() => onMarkAsSettled(due.id)}
          >
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Settle</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 rounded-none hover:bg-primary/10 flex items-center justify-center gap-2 touch-target transition-colors border-r border-border",
            due.status === 'Pending' ? 'flex-1' : 'flex-1'
          )}
          onClick={() => onEdit(due)}
        >
          <Edit2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 rounded-none hover:bg-destructive/10 flex items-center justify-center gap-2 touch-target transition-colors",
            due.status === 'Pending' ? 'flex-1' : 'flex-1'
          )}
          onClick={() => setDeletingDueId(due.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Delete</span>
        </Button>
      </div>
    </article>
  );

  const renderDuesTable = (duesList: Due[], title: string, colorClass: string) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <span className={`text-lg font-bold ${colorClass}`}>
            {formatTotals(calculateTotal(duesList)) || '0.00'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {duesList.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No dues found</p>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duesList.map((due) => (
                    <TableRow
                      key={due.id}
                      className={due.status === 'Settled' ? 'opacity-60' : ''}
                    >
                      <TableCell className="font-medium">{due.person_name}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(due.amount, due.currency)}
                      </TableCell>
                      <TableCell>
                        {due.due_date ? (
                          <span className={isOverdue(due.due_date) && due.status === 'Pending' ? 'text-destructive font-semibold' : ''}>
                            {format(new Date(due.due_date), 'MMM d, yyyy')}
                            {isOverdue(due.due_date) && due.status === 'Pending' && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Overdue
                              </Badge>
                            )}
                          </span>
                        ) : (
                          '–'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={due.status === 'Settled' ? 'secondary' : 'default'}
                          className={due.status === 'Settled' ? 'bg-accent-muted text-accent-foreground' : ''}
                        >
                          {due.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {due.notes || '–'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {due.status === 'Pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-accent hover:text-accent"
                              onClick={() => onMarkAsSettled(due.id)}
                              title="Mark as Settled"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
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
                            onClick={() => setDeletingDueId(due.id)}
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
                  {duesList.map((due) => renderMobileCard(due, colorClass))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const dueToDelete = dues.find(due => due.id === deletingDueId);

  return (
    <div className="space-y-6">
      {renderDuesTable(iOweDues, 'I Owe', 'text-destructive')}
      {renderDuesTable(theyOweMeDues, 'They Owe Me', 'text-accent')}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingDueId}
        onClose={() => setDeletingDueId(null)}
        onConfirm={() => {
          if (deletingDueId) {
            onDelete(deletingDueId);
            setDeletingDueId(null);
          }
        }}
        entityName="Due"
        itemIdentifier={dueToDelete ? `${dueToDelete.person_name} (${formatCurrency(dueToDelete.amount, dueToDelete.currency)})` : undefined}
      />
    </div>
  );
};

export default DuesList;
