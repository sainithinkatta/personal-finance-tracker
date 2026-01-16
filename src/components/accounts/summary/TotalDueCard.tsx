import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTotalDue, formatBalance } from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface TotalDueCardProps {
  accounts: BankAccount[];
  isHidden: boolean;
}

export const TotalDueCard: React.FC<TotalDueCardProps> = ({
  accounts,
  isHidden,
}) => {
  const { totalDue, nextDueDate } = calculateTotalDue(accounts);

  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">
          Total Due This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            {/* Total Due Amount */}
            <div className="text-3xl font-bold text-red-600">
              {formatBalance(totalDue, 'USD', isHidden)}
            </div>
            {/* Next Due Date */}
            {nextDueDate && (
              <p className="text-xs text-gray-500">
                Next due: {format(nextDueDate, 'MMM d, yyyy')}
              </p>
            )}
            {!nextDueDate && totalDue === 0 && (
              <p className="text-xs text-gray-500">No payments due</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
