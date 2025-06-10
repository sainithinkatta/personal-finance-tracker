
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { CURRENCIES } from '@/types/expense';

const BankAccountsSnapshot: React.FC = () => {
  const { bankAccounts } = useBankAccounts();

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Get the color class for balance display
  const getBalanceColorClass = (balance: number) => {
    return balance < 0 ? 'text-red-600' : 'text-green-600';
  };

  // Only show on tablet/mobile when sidebar is hidden
  return (
    <div className="xl:hidden">
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Bank Accounts</span>
            <Button size="sm" variant="outline" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {bankAccounts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No bank accounts added yet.</p>
              <p className="text-xs mt-1">Add your first account to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.slice(0, 3).map((account) => (
                <div
                  key={account.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{account.name}</h4>
                      <p className={`text-lg font-bold mt-1 ${getBalanceColorClass(account.balance)}`}>
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(account.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountsSnapshot;
