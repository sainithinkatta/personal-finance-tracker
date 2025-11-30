
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CURRENCIES } from '@/types/expense';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useToast } from '@/hooks/use-toast';
import { BankAccount } from '@/types/bankAccount';

interface BankAccountFormProps {
  onClose: () => void;
  account?: BankAccount;
  bankAccounts: BankAccount[];
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onClose, account, bankAccounts }) => {
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
    <form onSubmit={handleSubmit} className="space-y-4 px-1 sm:px-0">
      <div className="space-y-2">
        <Label htmlFor="account-name">Account Name</Label>
        <Input
          id="account-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Main Checking"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency">
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
        <Label htmlFor="account-type">Account Type</Label>
        <Select value={accountType} onValueChange={setAccountType}>
          <SelectTrigger id="account-type">
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
            <Label htmlFor="credit-limit">Credit Limit</Label>
            <Input
              id="credit-limit"
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
            <Label htmlFor="available-balance">Available Balance</Label>
            <Input
              id="available-balance"
              value={availableBalance}
              onChange={(e) => setAvailableBalance(e.target.value)}
              placeholder="e.g., 12,500"
              type="number"
              step="0.01"
              min="0"
              required
              className={cn(availableBalanceError && 'border-destructive focus-visible:ring-destructive')}
            />
            {availableBalanceError && (
              <p className="text-sm text-destructive">{availableBalanceError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-due-date">Payment Due Date</Label>
            <Input
              id="payment-due-date"
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value)}
              placeholder="e.g., 20"
              type="number"
              min="1"
              max="31"
              required
            />
            <p className="text-xs text-muted-foreground">Day of month when payment is due (1-31)</p>
          </div>

          {creditLimit && availableBalance && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Computed Due Balance (Read-only)</Label>
              <div className="p-3 bg-muted/50 rounded-md border">
                <span className="text-sm font-semibold">
                  {computedDueBalance < 0 ? (
                    <span className="text-destructive">
                      -{Math.abs(computedDueBalance).toFixed(2)}
                      <span className="text-xs ml-2">⚠️ Negative balance detected</span>
                    </span>
                  ) : (
                    <span className="text-foreground">
                      ${computedDueBalance.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="initial-balance">Initial Balance</Label>
          <Input
            id="initial-balance"
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

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          className="flex-1"
          disabled={!!availableBalanceError}
        >
          {isEditing ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
};

export default BankAccountForm;
