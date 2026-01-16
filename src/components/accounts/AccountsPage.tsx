import React, { useState } from 'react';
import { Landmark, CreditCard } from 'lucide-react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { BankAccount } from '@/types/bankAccount';
import { AccountsHeader } from './AccountsHeader';
import { TotalBalanceCard } from './summary/TotalBalanceCard';
import { CreditUtilizationCard } from './summary/CreditUtilizationCard';
import { TotalDueCard } from './summary/TotalDueCard';
import { DebitAccountCard } from './cards/DebitAccountCard';
import { CreditCardCard } from './cards/CreditCardCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import BankAccountForm from '@/components/BankAccountForm';
import { Button } from '@/components/ui/button';

export const AccountsPage: React.FC = () => {
  const { bankAccounts, deleteBankAccount, isLoading } = useBankAccounts();
  const [expandedCreditCards, setExpandedCreditCards] = useState<Set<string>>(
    new Set()
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);

  // Separate accounts by type
  const debitAccounts = bankAccounts.filter((a) => a.account_type === 'Debit');
  const creditAccounts = bankAccounts.filter((a) => a.account_type === 'Credit');

  // Toggle credit card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCreditCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Handle account actions
  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
  };

  const handleDelete = (account: BankAccount) => {
    setDeletingAccount(account);
  };

  const confirmDelete = () => {
    if (deletingAccount) {
      deleteBankAccount(deletingAccount.id);
      setDeletingAccount(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AccountsHeader
        onAddAccount={() => setIsAddDialogOpen(true)}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TotalBalanceCard accounts={bankAccounts} isHidden={false} />
        <CreditUtilizationCard
          accounts={bankAccounts}
          isHidden={false}
        />
        <TotalDueCard accounts={bankAccounts} isHidden={false} />
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Debit Accounts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Debit Accounts
            </h2>
          </div>
          {debitAccounts.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <Landmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No debit accounts yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first debit account to get started
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
              >
                Add Debit Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {debitAccounts.map((account) => (
                <DebitAccountCard
                  key={account.id}
                  account={account}
                  isHidden={false}
                  onEdit={() => handleEdit(account)}
                  onDelete={() => handleDelete(account)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Credit Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Credit Cards
            </h2>
          </div>
          {creditAccounts.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No credit cards yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first credit card to get started
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
              >
                Add Credit Card
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {creditAccounts.map((account) => (
                <CreditCardCard
                  key={account.id}
                  account={account}
                  isHidden={false}
                  isExpanded={expandedCreditCards.has(account.id)}
                  onToggleExpand={() => toggleCardExpansion(account.id)}
                  onEdit={() => handleEdit(account)}
                  onDelete={() => handleDelete(account)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            onClose={() => setIsAddDialogOpen(false)}
            bankAccounts={bankAccounts}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog
        open={!!editingAccount}
        onOpenChange={() => setEditingAccount(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <BankAccountForm
              account={editingAccount}
              onClose={() => setEditingAccount(null)}
              bankAccounts={bankAccounts}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAccount}
        onOpenChange={() => setDeletingAccount(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bank account "
              {deletingAccount?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
