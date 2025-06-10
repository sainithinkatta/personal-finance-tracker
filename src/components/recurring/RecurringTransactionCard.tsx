
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, RotateCcw, DollarSign, ShoppingCart, Zap, Package } from 'lucide-react';
import { RecurringTransaction } from '@/types/recurringTransaction';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Travel':
      return <DollarSign className="h-4 w-4 text-blue-600" />;
    case 'Groceries':
      return <ShoppingCart className="h-4 w-4 text-green-600" />;
    case 'Bills':
      return <Zap className="h-4 w-4 text-orange-600" />;
    case 'Others':
      return <Package className="h-4 w-4 text-purple-600" />;
    default:
      return <Package className="h-4 w-4 text-gray-600" />;
  }
};

const getFrequencyBadgeColor = (frequency: string) => {
  switch (frequency) {
    case 'daily':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'weekly':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'monthly':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'yearly':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatCurrency = (amount: number, currency: string) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
};

export const RecurringTransactionCard: React.FC<RecurringTransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Left side - Icon, Title, and Details */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <RotateCcw className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">{transaction.name}</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Next due: {format(new Date(transaction.next_due_date), 'MMM d, yyyy')}
            </p>
            <div className="flex items-center gap-2">
              {getCategoryIcon(transaction.category)}
              <span className="text-sm text-gray-600">Category: {transaction.category}</span>
            </div>
          </div>
        </div>

        {/* Right side - Amount, Frequency, and Actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getFrequencyBadgeColor(transaction.frequency)}`}
            >
              {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
            </Badge>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              aria-label={`Edit ${transaction.name} recurring transaction`}
            >
              <Edit className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 rounded-full"
              aria-label={`Delete ${transaction.name} recurring transaction`}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
