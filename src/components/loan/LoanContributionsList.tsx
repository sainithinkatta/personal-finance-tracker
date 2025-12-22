import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loan, LoanContribution, LoanContributionFormData } from '@/types/loan';
import { formatLoanCurrency } from '@/utils/loanCalculations';
import LoanContributionForm from './LoanContributionForm';

interface LoanContributionsListProps {
  loanId: string;
  loan: Loan;
  contributions: LoanContribution[];
  currency: string;
  onUpdate: (data: { id: string; formData: Partial<LoanContributionFormData> }) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

const LoanContributionsList: React.FC<LoanContributionsListProps> = ({
  loanId,
  loan,
  contributions,
  currency,
  onUpdate,
  onDelete,
  isUpdating = false,
}) => {
  const [editingContribution, setEditingContribution] = useState<LoanContribution | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpdate = (formData: LoanContributionFormData) => {
    if (editingContribution) {
      onUpdate({ id: editingContribution.id, formData });
      setEditingContribution(null);
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  if (contributions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No contributions recorded yet.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.map((contribution) => (
              <TableRow key={contribution.id}>
                <TableCell className="font-medium">
                  {format(new Date(contribution.contribution_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  -{formatLoanCurrency(contribution.amount, currency)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {contribution.note || '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingContribution(contribution)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingId(contribution.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingContribution}
        onOpenChange={(open) => !open && setEditingContribution(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contribution</DialogTitle>
          </DialogHeader>
          {editingContribution && (
            <LoanContributionForm
              loanId={loanId}
              loan={loan}
              contribution={editingContribution}
              onSubmit={handleUpdate}
              onCancel={() => setEditingContribution(null)}
              isSubmitting={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contribution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contribution? This will update the outstanding balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LoanContributionsList;
