import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calculator, GraduationCap, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useLoans } from '@/hooks/useLoans';
import { useLoanContributions } from '@/hooks/useLoanContributions';
import { Loan, LoanFormData, LoanContributionFormData } from '@/types/loan';
import LoanForm from './LoanForm';
import LoanSummaryCard from './LoanSummaryCard';
import LoanProjectionTable from './LoanProjectionTable';
import LoanContributionForm from './LoanContributionForm';
import LoanContributionsList from './LoanContributionsList';

const LoanDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { loans, isLoading, addLoan, updateLoan, deleteLoan, isAdding, isUpdating } = useLoans();
  
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [monthsAhead, setMonthsAhead] = useState<number>(6);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingLoanId, setDeletingLoanId] = useState<string | null>(null);

  // Get selected loan
  const selectedLoan = selectedLoanId 
    ? loans.find(l => l.id === selectedLoanId) 
    : loans[0];

  // Use first loan by default when loans load
  React.useEffect(() => {
    if (!selectedLoanId && loans.length > 0) {
      setSelectedLoanId(loans[0].id);
    }
  }, [loans, selectedLoanId]);

  // Fetch contributions for selected loan
  const { 
    contributions, 
    addContribution, 
    updateContribution, 
    deleteContribution,
    isAdding: isAddingContribution,
    isUpdating: isUpdatingContribution,
  } = useLoanContributions(selectedLoan?.id || null);

  const handleAddLoan = (data: LoanFormData) => {
    addLoan(data);
    setIsFormOpen(false);
  };

  const handleUpdateLoan = (data: LoanFormData) => {
    if (editingLoan) {
      updateLoan({ id: editingLoan.id, formData: data });
      setEditingLoan(null);
    }
  };

  const handleDeleteLoan = () => {
    if (deletingLoanId) {
      deleteLoan(deletingLoanId);
      setDeletingLoanId(null);
      if (selectedLoanId === deletingLoanId) {
        setSelectedLoanId(null);
      }
    }
  };

  const handleAddContribution = (data: LoanContributionFormData) => {
    addContribution(data);
  };

  // Form modal for loan
  const FormModal = () => {
    const isOpen = isFormOpen || !!editingLoan;
    const handleClose = () => {
      setIsFormOpen(false);
      setEditingLoan(null);
    };

    if (isMobile) {
      return (
        <BottomSheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>
                {editingLoan ? 'Edit Loan' : 'Add Loan'}
              </BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              <LoanForm
                loan={editingLoan || undefined}
                onSubmit={editingLoan ? handleUpdateLoan : handleAddLoan}
                onClose={handleClose}
                isSubmitting={isAdding || isUpdating}
              />
            </BottomSheetBody>
          </BottomSheetContent>
        </BottomSheet>
      );
    }

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoan ? 'Edit Loan' : 'Add Loan'}
            </DialogTitle>
          </DialogHeader>
          <LoanForm
            loan={editingLoan || undefined}
            onSubmit={editingLoan ? handleUpdateLoan : handleAddLoan}
            onClose={handleClose}
            isSubmitting={isAdding || isUpdating}
          />
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Empty state
  if (loans.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Loans Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Add your first loan to start tracking and projecting your repayment journey.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Loan
          </Button>
        </div>
        <FormModal />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with loan selector and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {loans.length > 1 && (
              <Select value={selectedLoanId || ''} onValueChange={setSelectedLoanId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select 
              value={monthsAhead.toString()} 
              onValueChange={(v) => setMonthsAhead(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedLoan && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingLoan(selectedLoan)}
                >
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeletingLoanId(selectedLoan.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Loan
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        {selectedLoan && (
          <LoanSummaryCard 
            loan={selectedLoan} 
            contributions={contributions}
            monthsAhead={monthsAhead}
          />
        )}

        {/* Contribution Form */}
        {selectedLoan && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Contribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoanContributionForm
                loanId={selectedLoan.id}
                onSubmit={handleAddContribution}
                isSubmitting={isAddingContribution}
              />
            </CardContent>
          </Card>
        )}

        {/* Contributions List */}
        {selectedLoan && contributions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Contributions ({contributions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LoanContributionsList
                loanId={selectedLoan.id}
                contributions={contributions}
                currency={selectedLoan.currency}
                onUpdate={updateContribution}
                onDelete={deleteContribution}
                isUpdating={isUpdatingContribution}
              />
            </CardContent>
          </Card>
        )}

        {/* Projection Table */}
        {selectedLoan && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                {monthsAhead}-Month Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LoanProjectionTable
                loan={selectedLoan}
                contributions={contributions}
                monthsAhead={monthsAhead}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Modal */}
      <FormModal />

      {/* Delete Confirmation */}
      <AlertDialog 
        open={!!deletingLoanId} 
        onOpenChange={(open) => !open && setDeletingLoanId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this loan? This will also delete all associated contributions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLoan}
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

export default LoanDashboard;
