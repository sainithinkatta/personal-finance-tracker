import React from 'react';
import { Edit2, Trash2, Landmark } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBalance, getCurrencyFlag } from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface DebitAccountCardProps {
  account: BankAccount;
  isHidden: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const DebitAccountCard: React.FC<DebitAccountCardProps> = ({
  account,
  isHidden,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          {/* Account Name & Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {account.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getCurrencyFlag(account.currency)} {account.currency}
              </Badge>
              <span className="text-xs text-gray-500">
                Updated {format(new Date(account.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            title="Edit account"
          >
            <Edit2 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
            title="Delete account"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-gray-50 rounded-lg p-3 mt-3">
        <p className="text-xs text-gray-600 mb-1">Available Balance</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatBalance(account.balance, account.currency, isHidden)}
        </p>
      </div>
    </div>
  );
};
