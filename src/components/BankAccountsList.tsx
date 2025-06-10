
import React, { useState } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { CURRENCIES } from '@/types/expense';
import { BankAccount } from '@/types/bankAccount';
import BankAccountForm from './BankAccountForm';

const BankAccountsList: React.FC = () => {
  const { bankAccounts, deleteBankAccount } = useBankAccounts();

  const [viewingAccount, setViewingAccount] = useState<BankAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Format a numeric amount into a currency string, e.g. "$1,234.56"
  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find((c) => c.code === currency);
    const symbol = currencyInfo?.symbol || currency;
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Render a small badge indicating "Credit" or "Debit"
  const getAccountTypeBadge = (accountType: string) => {
    const isCredit = accountType.toLowerCase() === 'credit';
    return (
      <span
        className={`inline-flex items-center px-1 py-0.5 rounded-full text-[10px] font-medium ${
          isCredit
            ? 'bg-orange-100 text-orange-800 border border-orange-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}
      >
        {isCredit ? 'Credit' : 'Debit'}
      </span>
    );
  };

  // Decide which balance to show: for credit accounts, preferentially show available_balance
  const getDisplayBalance = (account: BankAccount) => {
    if (account.account_type?.toLowerCase() === 'credit') {
      if (
        account.available_balance !== undefined &&
        account.available_balance !== null
      ) {
        return formatCurrency(account.available_balance, account.currency);
      }
      return formatCurrency(account.balance, account.currency);
    }
    // For debit accounts, just show regular balance
    return formatCurrency(account.balance, account.currency);
  };

  // Get the actual balance value for color determination
  const getBalanceValue = (account: BankAccount) => {
    if (account.account_type?.toLowerCase() === 'credit') {
      if (
        account.available_balance !== undefined &&
        account.available_balance !== null
      ) {
        return account.available_balance;
      }
      return account.balance;
    }
    return account.balance;
  };

  // Get the color class for balance display
  const getBalanceColorClass = (account: BankAccount) => {
    const balanceValue = getBalanceValue(account);
    return balanceValue < 0 ? 'text-red-600' : 'text-green-600';
  };

  // Handlers for opening view, edit, and delete dialogs
  const handleView = (account: BankAccount) => {
    setViewingAccount(account);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    // also close view dialog if open
    setViewingAccount(null);
  };

  const handleDelete = (account: BankAccount) => {
    setDeletingAccount(account);
    setDeleteError(null);
    // also close view dialog if open
    setViewingAccount(null);
  };

  // Confirm deletion: call deleteBankAccount, handle loading/error states
  const confirmDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteBankAccount(deletingAccount.id);
      setDeletingAccount(null);
    } catch (error) {
      setDeleteError('Failed to delete bank account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Close the delete confirmation dialog (unless a deletion is in progress)
  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setDeletingAccount(null);
      setDeleteError(null);
    }
  };

  // If there are no bank accounts, show a simple empty state
  if (bankAccounts.length === 0) {
    return (
      <div className="text-center py-4 px-2">
        <p className="text-xs text-gray-500">No bank accounts added.</p>
        <p className="text-xs text-gray-400 mt-1.5">
          Add your first account to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* List of Bank Account Cards */}
      <div className="space-y-2">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="p-2.5 border border-gray-100 rounded-md hover:bg-gray-50 hover:border-gray-200 transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="flex items-center font-medium text-gray-900 text-xs leading-tight truncate">
                    <span className="truncate">{account.name}</span>
                    {account.account_type && (
                      <span className="ml-2 leading-none">
                        {getAccountTypeBadge(account.account_type)}
                      </span>
                    )}
                  </h4>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleView(account)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Main Balance with conditional color */}
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className={`text-sm font-semibold leading-tight ${getBalanceColorClass(account)}`}>
                    {getDisplayBalance(account)}
                  </p>
                </div>

                {/* If a credit account has a due balance, show it below in red */}
                {account.account_type?.toLowerCase() === 'credit' &&
                  account.due_balance !== undefined &&
                  account.due_balance !== null &&
                  account.due_balance > 0 && (
                    <p className="text-xs text-red-600 mt-0.5 leading-tight">
                      Due: {formatCurrency(account.due_balance, account.currency)}
                    </p>
                  )}

                {/* Last-updated date, formatted as "MMM d, yy" (e.g., "Jun 2, '25") */}
                <p className="text-xs text-gray-400 mt-1 leading-tight">
                  {new Date(account.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Account Dialog */}
      <Dialog open={!!viewingAccount} onOpenChange={() => setViewingAccount(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Bank Account Details
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-gray-500">
              View all information for this account.
            </DialogDescription>
          </DialogHeader>

          {viewingAccount && (
            <div className="mt-4">
              <dl className="divide-y divide-gray-200">
                {/* Account Name */}
                <div className="flex justify-between py-3">
                  <dt className="text-[10px] font-medium text-gray-500 uppercase">Account Name</dt>
                  <dd className="text-sm text-gray-900">{viewingAccount.name}</dd>
                </div>

                {/* Account Type */}
                <div className="flex justify-between py-3">
                  <dt className="text-[10px] font-medium text-gray-500 uppercase">Account Type</dt>
                  <dd className="text-sm">
                    {getAccountTypeBadge(viewingAccount.account_type!)}
                  </dd>
                </div>

                {/* Balance with conditional color */}
                <div className="flex justify-between py-3">
                  <dt className="text-[10px] font-medium text-gray-500 uppercase">Balance</dt>
                  <dd className={`text-sm ${getBalanceColorClass(viewingAccount)}`}>{getDisplayBalance(viewingAccount)}</dd>
                </div>

                {/* Credit Limit (Credit Only) */}
                {viewingAccount.account_type?.toLowerCase() === 'credit' &&
                  viewingAccount.credit_limit !== undefined && (
                    <div className="flex justify-between py-3">
                      <dt className="text-[10px] font-medium text-gray-500 uppercase">Credit Limit</dt>
                      <dd className="text-sm text-gray-900">
                        {formatCurrency(
                          viewingAccount.credit_limit,
                          viewingAccount.currency
                        )}
                      </dd>
                    </div>
                  )}

                {/* Due Balance (Credit Only, red if below limit) */}
                {viewingAccount.account_type?.toLowerCase() === 'credit' &&
                  viewingAccount.due_balance !== undefined && (
                    <div className="flex justify-between py-3">
                      <dt className="text-[10px] font-medium text-gray-500 uppercase">Due Balance</dt>
                      <dd
                        className={`text-sm ${
                          viewingAccount.due_balance < (viewingAccount.credit_limit ?? 0)
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(
                          viewingAccount.due_balance,
                          viewingAccount.currency
                        )}
                      </dd>
                    </div>
                  )}

                {/* Currency */}
                <div className="flex justify-between py-3">
                  <dt className="text-[10px] font-medium text-gray-500 uppercase">Currency</dt>
                  <dd className="text-sm text-gray-900">{viewingAccount.currency}</dd>
                </div>

                {/* Last Updated */}
                <div className="flex justify-between py-3">
                  <dt className="text-[10px] font-medium text-gray-500 uppercase">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(viewingAccount.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <DialogFooter className="mt-6 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => viewingAccount && handleEdit(viewingAccount)}
              className="flex-1 text-sm border-gray-300 hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4 mr-1 text-gray-600" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => viewingAccount && handleDelete(viewingAccount)}
              className="flex-1 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <BankAccountForm
              account={editingAccount}
              onClose={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAccount}
        onOpenChange={handleDeleteDialogClose}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the bank account "
              {deletingAccount?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="px-6 pb-2">
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </div>
              ) : (
                'Yes, Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BankAccountsList;
