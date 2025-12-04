import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CreditCard, Wallet } from 'lucide-react';
import { ExpenseCategory, CategoryBankBreakdown } from '@/types/expense';

interface BankWiseCategoryBreakdownProps {
  data: CategoryBankBreakdown[];
  currentMonthLabel: string;
  currency?: string;
}

// Helper to get currency symbol
const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

// Category colors
const COLORS: Record<ExpenseCategory, string> = {
  Groceries: '#10b981',
  Food: '#f59e0b',
  Travel: '#3b82f6',
  Bills: '#ef4444',
  Others: '#6b7280',
};

// Helper to get account type icon
const getAccountTypeIcon = (accountType: string) => {
  if (accountType === 'Credit') {
    return <CreditCard className="w-4 h-4" />;
  } else if (accountType === 'Debit') {
    return <Wallet className="w-4 h-4" />;
  }
  return <Building2 className="w-4 h-4" />;
};

// Transform data: group by bank instead of category
interface BankCategorySpend {
  bank_account_id: string;
  bank_name: string;
  account_type: string;
  total: number;
  categories: { category: ExpenseCategory; amount: number }[];
}

const transformToBankGrouped = (data: CategoryBankBreakdown[]): BankCategorySpend[] => {
  const bankMap = new Map<string, BankCategorySpend>();

  data.forEach(categoryData => {
    categoryData.banks.forEach(bank => {
      if (bank.total_spent <= 0) return;

      if (!bankMap.has(bank.bank_account_id)) {
        bankMap.set(bank.bank_account_id, {
          bank_account_id: bank.bank_account_id,
          bank_name: bank.bank_name,
          account_type: bank.account_type,
          total: 0,
          categories: [],
        });
      }

      const bankEntry = bankMap.get(bank.bank_account_id)!;
      bankEntry.total += bank.total_spent;
      bankEntry.categories.push({
        category: categoryData.category,
        amount: bank.total_spent,
      });
    });
  });

  // Sort banks by total spending (descending) and categories within each bank
  return Array.from(bankMap.values())
    .sort((a, b) => b.total - a.total)
    .map(bank => ({
      ...bank,
      categories: bank.categories.sort((a, b) => b.amount - a.amount),
    }));
};

export const BankWiseCategoryBreakdown: React.FC<BankWiseCategoryBreakdownProps> = ({
  data,
  currentMonthLabel,
  currency = 'USD',
}) => {
  const bankGroupedData = transformToBankGrouped(data);
  const grandTotal = bankGroupedData.reduce((sum, bank) => sum + bank.total, 0);
  const symbol = getCurrencySymbol(currency);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm md:text-base font-medium text-gray-800 flex items-center">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
            <span>Expense Breakdown</span>
            <span className="ml-2 text-xs font-normal text-gray-500">({currentMonthLabel})</span>
          </CardTitle>
          {grandTotal > 0 && (
            <span className="text-sm font-bold text-gray-900">{symbol}{grandTotal.toFixed(2)}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4 flex-1 min-h-0 overflow-y-auto">
        {bankGroupedData.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No spending yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {bankGroupedData.map(bank => (
              <div
                key={bank.bank_account_id}
                className="p-3 bg-gray-50/80 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Bank Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-md ${
                      bank.account_type === 'Credit' 
                        ? 'bg-amber-100 text-amber-600' 
                        : bank.account_type === 'Debit'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getAccountTypeIcon(bank.account_type)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        {bank.bank_name}
                      </span>
                      {bank.account_type && bank.bank_account_id !== 'unassigned' && (
                        <span className="ml-2 text-[10px] text-gray-500 font-medium uppercase">
                          {bank.account_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {symbol}{bank.total.toFixed(2)}
                  </span>
                </div>

                {/* Categories - Horizontal Flow */}
                <div className="flex flex-wrap gap-1.5">
                  {bank.categories.map(({ category, amount }) => (
                    <div
                      key={category}
                      className="inline-flex items-center space-x-1.5 px-2 py-1 bg-white rounded-md border border-gray-200/80 shadow-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[category] }}
                      />
                      <span className="text-xs text-gray-700 font-medium">{category}</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {symbol}{amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
