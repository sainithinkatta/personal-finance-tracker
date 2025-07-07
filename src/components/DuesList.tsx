
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Due } from '@/types/due';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <AlertDialogContent>
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
