import React from 'react';
import { Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDebitTotals, formatBalance, getCurrencyFlag } from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface TotalBalanceCardProps {
  accounts: BankAccount[];
  isHidden: boolean;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  accounts,
  isHidden,
}) => {
  const { usd, inr, usdCount, inrCount } = calculateDebitTotals(accounts);

  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Total Balance</h3>
          <Badge className="ml-auto bg-green-100 text-green-700 border-0 hover:bg-green-100 uppercase text-[10px] font-medium px-2 py-0.5">
            Debit
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 2-column grid for currency boxes */}
        <div className="grid grid-cols-2 gap-3">
          {/* USD Box */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 pr-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-lg">{getCurrencyFlag('USD')}</span>
              <span className="text-[13px] font-medium text-slate-600">USD</span>
              <Badge className="ml-auto bg-slate-100 text-slate-600 border-0 hover:bg-slate-100 text-[11px] font-medium px-2 py-0.5 whitespace-nowrap">
                {usdCount} account{usdCount !== 1 ? 's' : ''}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatBalance(usd, 'USD', isHidden)}
            </p>
          </div>

          {/* INR Box */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-lg">{getCurrencyFlag('INR')}</span>
              <span className="text-[13px] font-medium text-slate-600">INR</span>
              <Badge className="ml-auto bg-slate-100 text-slate-600 border-0 hover:bg-slate-100 text-[11px] font-medium px-2 py-0.5 whitespace-nowrap">
                {inrCount} account{inrCount !== 1 ? 's' : ''}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatBalance(inr, 'INR', isHidden)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
