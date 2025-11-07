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

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${amount.toFixed(2)}`;
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
        "bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        due.status === 'Settled' && 'opacity-60'
      )}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Person Icon Section */}
          <div className={cn(
            "flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2",
            colorClass === 'text-red-600' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          )}>
            <User className={cn(
              "h-7 w-7",
              colorClass === 'text-red-600' ? 'text-red-600' : 'text-green-600'
            )} />
            <div className={cn(
              "text-xs font-bold mt-1 uppercase",
              colorClass === 'text-red-600' ? 'text-red-700' : 'text-green-700'
            )}>
              {due.type === 'I Owe' ? 'Owe' : 'Get'}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Name and Amount Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
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
                  due.status === 'Settled' && 'bg-green-100 text-green-800'
                )}
              >
                {due.status}
              </Badge>
              
              {due.due_date && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg",
                  isOverdue(due.due_date) && due.status === 'Pending'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
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
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {due.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center border-t border-gray-100 bg-gray-50/50">
        {due.status === 'Pending' && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-11 rounded-none hover:bg-green-50 flex items-center justify-center gap-2 touch-target transition-colors border-r border-gray-100"
            onClick={() => onMarkAsSettled(due.id)}
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Settle</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 rounded-none hover:bg-blue-50 flex items-center justify-center gap-2 touch-target transition-colors border-r border-gray-100",
            due.status === 'Pending' ? 'flex-1' : 'flex-1'
          )}
          onClick={() => onEdit(due)}
        >
          <Edit2 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 rounded-none hover:bg-red-50 flex items-center justify-center gap-2 touch-target transition-colors",
            due.status === 'Pending' ? 'flex-1' : 'flex-1'
          )}
          onClick={() => setDeletingDueId(due.id)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">Delete</span>
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
          <p className="text-gray-500 text-center py-4">No dues found</p>
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
                          <span className={isOverdue(due.due_date) && due.status === 'Pending' ? 'text-red-600 font-semibold' : ''}>
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
                          className={due.status === 'Settled' ? 'bg-green-100 text-green-800' : ''}
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
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
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
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
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
      {renderDuesTable(iOweDues, 'I Owe', 'text-red-600')}
      {renderDuesTable(theyOweMeDues, 'They Owe Me', 'text-green-600')}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDueId} onOpenChange={() => setDeletingDueId(null)}>
        <AlertDialogContent className="mx-auto w-[calc(100%-2rem)] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Due</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this due{dueToDelete ? ` for ${dueToDelete.person_name} (${formatCurrency(dueToDelete.amount, dueToDelete.currency)})` : ''}? 
              This action cannot be undone.
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

export default DuesList;