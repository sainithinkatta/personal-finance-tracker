import React from 'react';
import { RecurringPlanWithComputed } from '@/types/recurringPlan';
import { useRecurringPlans } from '@/hooks/useRecurringPlans';
import { EditRecurringTransactionForm } from '../EditRecurringTransactionForm';
import { RecurringTransactionWithStatus } from '@/hooks/useRecurringTransactions';

interface EditPlanDialogProps {
  plan: RecurringPlanWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPlanDialog: React.FC<EditPlanDialogProps> = ({ plan, isOpen, onClose }) => {
  const { updatePlan, isUpdating } = useRecurringPlans();

  if (!plan) return null;

  // Convert plan to the format expected by EditRecurringTransactionForm
  const transactionForForm: RecurringTransactionWithStatus = {
    ...plan,
    status: 'pending' as const,
    computedStatus: plan.isOverdue ? 'pending' : 'upcoming',
  };

  const handleSave = (id: string, data: any) => {
    updatePlan({ id, data });
    onClose();
  };

  return (
    <EditRecurringTransactionForm
      transaction={transactionForForm}
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isLoading={isUpdating}
    />
  );
};
