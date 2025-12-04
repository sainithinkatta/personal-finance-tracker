import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIncome } from '@/hooks/useIncome';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, DollarSign, IndianRupee } from 'lucide-react';

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ open, onOpenChange }) => {
  const [currency, setCurrency] = useState('USD');
  const [bankAccountId, setBankAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');

  const { addIncome, isAdding } = useIncome();
  const { bankAccounts } = useBankAccounts();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Filter bank accounts by selected currency
  const filteredBankAccounts = bankAccounts.filter(
    (acct) => acct.currency === currency
  );

  // Clear bank selection when currency changes if current bank doesn't match
  useEffect(() => {
    if (bankAccountId) {
      const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);
      if (selectedBank && selectedBank.currency !== currency) {
        setBankAccountId('');
        toast({
          title: 'Bank Selection Reset',
          description: 'Bank selection cleared because currency changed.',
        });
      }
    }
  }, [currency, bankAccountId, bankAccounts, toast]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCurrency('USD');
      setBankAccountId('');
      setAmount('');
      setDescription('');
      setAmountError('');
    }
  }, [open]);

  const validateAmount = (value: string): boolean => {
    if (!value.trim()) {
      setAmountError('Amount is required');
      return false;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setAmountError('Please enter a valid number');
      return false;
    }
    if (numValue <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point, max 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      if (value) validateAmount(value);
      else setAmountError('');
    }
  };

  const isFormValid = currency && bankAccountId && amount && !amountError && parseFloat(amount) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAmount(amount)) return;
    if (!bankAccountId) {
      toast({
        title: 'Error',
        description: 'Please select a bank account.',
        variant: 'destructive',
      });
      return;
    }

    // Verify currency-bank match (edge case guard)
    const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);
    if (selectedBank && selectedBank.currency !== currency) {
      toast({
        title: 'Currency Mismatch',
        description: 'Selected bank currency does not match the chosen currency.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addIncome({
        bank_account_id: bankAccountId,
        amount: parseFloat(amount),
        currency,
        description: description.trim() || undefined,
      });
      onOpenChange(false);
    } catch {
      // Error handled in hook, keep modal open with preserved inputs
    }
  };

  const getCurrencySymbol = () => {
    return currency === 'INR' ? <IndianRupee className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />;
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Currency Selection */}
      <div className="space-y-2">
        <Label htmlFor="currency">Currency *</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">$ US Dollar</SelectItem>
            <SelectItem value="INR">₹ Indian Rupee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bank Account Selection */}
      <div className="space-y-2">
        <Label htmlFor="bankAccount">Bank Account *</Label>
        <Select
          value={bankAccountId}
          onValueChange={setBankAccountId}
          disabled={filteredBankAccounts.length === 0}
        >
          <SelectTrigger id="bankAccount">
            <SelectValue placeholder={filteredBankAccounts.length === 0 ? `No ${currency} accounts` : "Select bank account"} />
          </SelectTrigger>
          <SelectContent>
            {filteredBankAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.account_type || 'Debit'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filteredBankAccounts.length === 0 && (
          <p className="text-sm text-amber-600">
            No bank accounts available for {currency}. Add a {currency} account first.
          </p>
        )}
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {getCurrencySymbol()}
          </div>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            className={`pl-9 ${amountError ? 'border-destructive' : ''}`}
            disabled={!bankAccountId}
          />
        </div>
        {amountError && (
          <p className="text-sm text-destructive">{amountError}</p>
        )}
      </div>

      {/* Description (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="e.g., Salary, Freelance payment..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isFormValid || isAdding}
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Income'
        )}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Add Income</BottomSheetTitle>
          </BottomSheetHeader>
          <BottomSheetBody>{formContent}</BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddIncomeModal;
