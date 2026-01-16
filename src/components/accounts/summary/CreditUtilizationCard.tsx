import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  calculateCreditUtilization,
  getUtilizationColor,
  formatBalance,
} from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface CreditUtilizationCardProps {
  accounts: BankAccount[];
  isHidden: boolean;
}

export const CreditUtilizationCard: React.FC<CreditUtilizationCardProps> = ({
  accounts,
  isHidden,
}) => {
  const { totalLimit, totalUsed, percentage } =
    calculateCreditUtilization(accounts);
  const colorClasses = getUtilizationColor(percentage);

  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">
          Credit Utilization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            {/* Percentage */}
            <div className={`text-3xl font-bold ${colorClasses.text}`}>
              {isHidden ? '••••' : `${percentage.toFixed(1)}%`}
            </div>
            {/* Progress Bar */}
            <div className="space-y-1">
              <Progress
                value={isHidden ? 0 : percentage}
                className="h-2"
                indicatorClassName={colorClasses.progress}
              />
            </div>
            {/* Subtext */}
            <p className="text-xs text-gray-500">
              {isHidden ? (
                <>••••• of •••••</>
              ) : (
                <>
                  {formatBalance(totalUsed, 'USD', false)} of{' '}
                  {formatBalance(totalLimit, 'USD', false)}
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
