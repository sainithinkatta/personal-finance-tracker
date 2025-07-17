
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES } from '@/types/expense';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useToast } from '@/hooks/use-toast';
import { BankAccount } from '@/types/bankAccount';

interface BankAccountFormProps {
  onClose: () => void;
  account?: BankAccount;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onClose, account }) => {
  const { toast } = useToast();
  const { addBankAccount, updateBankAccount } = useBankAccounts();
  const [name, setName] = useState(account?.name || '');
  const [balance, setBalance] = useState(account?.balance?.toString() || '');
  const [currency, setCurrency] = useState(account?.currency || 'USD');
  const [accountType, setAccountType] = useState(account?.account_type || 'Debit');
  const [creditLimit, setCreditLimit] = useState(account?.credit_limit?.toString() || '');
  const [availableBalance, setAvailableBalance] = useState(account?.available_balance?.toString() || '');
  const [paymentDueDate, setPaymentDueDate] = useState(account?.payment_due_date?.toString() || '');
  const [availableBalanceError, setAvailableBalanceError] = useState('');

  const isEditing = !!account;

  // Calculate due balance for credit accounts
  const computedDueBalance = accountType === 'Credit' && creditLimit && availableBalance 
    ? Number(creditLimit) - Number(availableBalance) 
    : 0;

  // Validate available balance against credit limit
  useEffect(() => {
    if (accountType === 'Credit' && creditLimit && availableBalance) {
      if (Number(availableBalance) > Number(creditLimit)) {
        setAvailableBalanceError('Available balance cannot exceed credit limit');
      } else {
        setAvailableBalanceError('');
      }
    } else {
      setAvailableBalanceError('');
    }
  }, [accountType, creditLimit, availableBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid account name',
        variant: 'destructive',
      });
      return;
    }

    if (accountType === 'Credit') {
      if (!creditLimit || !availableBalance || !paymentDueDate ||
          isNaN(Number(creditLimit)) || isNaN(Number(availableBalance)) || isNaN(Number(paymentDueDate))) {
        toast({
          title: 'Invalid Input',
          description: 'Please enter valid credit limit, available balance and payment due date for credit accounts',
          variant: 'destructive',
        });
        return;
      }

      if (Number(paymentDueDate) < 1 || Number(paymentDueDate) > 31) {
        toast({
          title: 'Invalid Input',
          description: 'Payment due date must be between 1 and 31',
          variant: 'destructive',
        });
        return;
      }

      if (availableBalanceError) {
        toast({
          title: 'Invalid Input',
          description: availableBalanceError,
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!balance || isNaN(Number(balance))) {
        toast({
          title: 'Invalid Input',
          description: 'Please enter a valid balance',
          variant: 'destructive',
        });
        return;
      }
    }

    const accountData = {
      name: name.trim(),
      balance: accountType === 'Credit' ? Number(creditLimit) : Number(balance),
      currency,
      account_type: accountType,
      ...(accountType === 'Credit' && {
        credit_limit: Number(creditLimit),
        available_balance: Number(availableBalance),
        due_balance: computedDueBalance,
        payment_due_date: Number(paymentDueDate),
      }),
    };

    if (isEditing) {
      updateBankAccount({ id: account.id, data: accountData });
    } else {
      addBankAccount(accountData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Account Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Main Checking"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Currency</label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.symbol} {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Account Type</label>
        <Select value={accountType} onValueChange={setAccountType}>
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Debit">Debit</SelectItem>
            <SelectItem value="Credit">Credit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {accountType === 'Credit' ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit Limit</label>
            <Input
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="e.g., 50,000"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Available Balance</label>
            <Input
              value={availableBalance}
              onChange={(e) => setAvailableBalance(e.target.value)}
              placeholder="e.g., 12,500"
              type="number"
              step="0.01"
              min="0"
              required
              className={availableBalanceError ? 'border-red-500' : ''}
            />
            {availableBalanceError && (
              <p className="text-sm text-red-500">{availableBalanceError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Due Date</label>
            <Input
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value)}
              placeholder="e.g., 20"
              type="number"
              min="1"
              max="31"
              required
            />
            <p className="text-xs text-gray-500">Day of month when payment is due (1-31)</p>
          </div>

          {creditLimit && availableBalance && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Computed Due Balance (Read-only)</label>
              <div className="p-2 bg-gray-50 rounded border">
                <span className="text-sm font-semibold">
                  {computedDueBalance < 0 ? (
                    <span className="text-red-600">
                      -{Math.abs(computedDueBalance).toFixed(2)}
                      <span className="text-xs ml-2 text-red-500">⚠️ Negative balance detected</span>
                    </span>
                  ) : (
                    computedDueBalance.toFixed(2)
                  )}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">Initial Balance</label>
          <Input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 flex-1"
          disabled={!!availableBalanceError}
        >
          {isEditing ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
};

export default BankAccountForm;
