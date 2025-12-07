import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { BankAccountFormData } from '@/types/bankAccount';
import { CURRENCIES } from '@/types/expense';

const BankAccountManager: React.FC = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, isAdding } = useBankAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState<BankAccountFormData>({
    name: '',
    balance: 0,
    currency: 'USD',
    account_type: 'Debit',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      balance: 0,
      currency: 'USD',
      account_type: 'Debit',
    });
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      updateBankAccount({ id: editingAccount, data: formData });
    } else {
      addBankAccount(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (account: any) => {
    setFormData({
      name: account.name,
      balance: account.balance,
      currency: account.currency,
      account_type: account.account_type || 'Debit',
      ...(account.account_type === 'Credit' && {
        credit_limit: account.credit_limit,
        available_balance: account.available_balance,
        due_balance: account.due_balance,
        payment_due_date: account.payment_due_date,
        apr: account.apr ?? 0,
        minimum_payment: account.minimum_payment ?? 0,
      }),
    });
    setEditingAccount(account.id);
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank Accounts</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Update your bank account details.' : 'Add a new bank account to track your finances.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., Chase Checking"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">
                    Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account_type" className="text-right">
                    Account Type
                  </Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Debit">Debit</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.account_type === 'Credit' ? (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="credit_limit" className="text-right">
                        Credit Limit
                      </Label>
                      <Input
                        id="credit_limit"
                        type="number"
                        step="0.01"
                        value={formData.credit_limit || ''}
                        onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="50000"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="available_balance" className="text-right">
                        Available Balance
                      </Label>
                      <Input
                        id="available_balance"
                        type="number"
                        step="0.01"
                        value={formData.available_balance || ''}
                        onChange={(e) => setFormData({ ...formData, available_balance: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="12500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="payment_due_date" className="text-right">
                        Due Date (Day)
                      </Label>
                      <Input
                        id="payment_due_date"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.payment_due_date || ''}
                        onChange={(e) => setFormData({ ...formData, payment_due_date: parseInt(e.target.value) || 1 })}
                        className="col-span-3"
                        placeholder="20"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="apr" className="text-right">
                        APR (%)
                      </Label>
                      <Input
                        id="apr"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.apr ?? ''}
                        onChange={(e) => setFormData({ ...formData, apr: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="18.99"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="minimum_payment" className="text-right">
                        Min. Payment
                      </Label>
                      <Input
                        id="minimum_payment"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minimum_payment ?? ''}
                        onChange={(e) => setFormData({ ...formData, minimum_payment: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="balance" className="text-right">
                      Balance
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                      className="col-span-3"
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bank accounts added yet. Add your first account to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-2xl font-bold text-accent">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(account.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(account)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          bank account "{account.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteBankAccount(account.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountManager;