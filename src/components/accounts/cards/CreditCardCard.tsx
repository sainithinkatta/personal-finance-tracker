import React from 'react';
import { Edit2, Trash2, CreditCard, ChevronDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatBalance, getUtilizationColor } from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';
import { cn } from '@/lib/utils';

interface CreditCardCardProps {
  account: BankAccount;
  isHidden: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const CreditCardCard: React.FC<CreditCardCardProps> = ({
  account,
  isHidden,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) => {
  const creditLimit = account.credit_limit || 0;
  const availableBalance = account.available_balance || 0;
  const dueBalance = account.due_balance || 0;
  const utilization =
    creditLimit > 0 ? (dueBalance / creditLimit) * 100 : 0;
  const colorClasses = getUtilizationColor(utilization);

  // Calculate minimum payment (if not set, use 2% of due balance or $25, whichever is higher)
  const minimumPayment =
    account.minimum_payment || Math.max(dueBalance * 0.02, 25);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Main Card Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            {/* Card Name */}
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {account.name}
              </h3>
              <Badge
                variant="outline"
                className="text-xs mt-1 bg-amber-50 text-amber-700 border-amber-300"
              >
                Credit Card
              </Badge>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              title="Edit card"
            >
              <Edit2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDelete}
              title="Delete card"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleExpand}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-600 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Current Balance</p>
            <p className="text-xl font-bold text-red-600">
              {formatBalance(dueBalance, account.currency, isHidden)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Available Credit</p>
            <p className="text-xl font-bold text-green-600">
              {formatBalance(availableBalance, account.currency, isHidden)}
            </p>
          </div>
        </div>

        {/* Credit Utilization */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Credit Utilization</p>
            <p className={`text-sm font-semibold ${colorClasses.text}`}>
              {isHidden ? '••••' : `${utilization.toFixed(1)}%`}
            </p>
          </div>
          <Progress
            value={isHidden ? 0 : utilization}
            className="h-2"
            indicatorClassName={colorClasses.progress}
          />
          <p className="text-xs text-gray-500 mt-1">
            Limit: {formatBalance(creditLimit, account.currency, isHidden)}
          </p>
        </div>

        {/* Payment Due */}
        {account.payment_due_date && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Payment due on {account.payment_due_date}
                  {account.payment_due_date === 1
                    ? 'st'
                    : account.payment_due_date === 2
                    ? 'nd'
                    : account.payment_due_date === 3
                    ? 'rd'
                    : 'th'}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Min. payment:{' '}
                  {formatBalance(minimumPayment, account.currency, isHidden)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-3">
            {/* APR */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">% APR</span>
              <span className="text-sm font-medium text-gray-900">
                {isHidden ? '••••' : `${(account.apr || 0).toFixed(2)}%`}
              </span>
            </div>
            {/* Credit Limit */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">$ Credit Limit</span>
              <span className="text-sm font-medium text-gray-900">
                {formatBalance(creditLimit, account.currency, isHidden)}
              </span>
            </div>
            {/* Last Updated */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {format(new Date(account.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
