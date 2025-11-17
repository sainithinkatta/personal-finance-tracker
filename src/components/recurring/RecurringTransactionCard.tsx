
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, RotateCcw, DollarSign, ShoppingCart, Zap, Package, Check } from 'lucide-react';
import { RecurringTransaction } from '@/types/recurringTransaction';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { parseLocalDate } from '@/utils/dateUtils';

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onMarkAsDone: (id: string) => void;
  isMarkingDone?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Travel':
      return <DollarSign className="h-4 w-4 text-info" />;
    case 'Groceries':
      return <ShoppingCart className="h-4 w-4 text-accent" />;
    case 'Bills':
      return <Zap className="h-4 w-4 text-warning" />;
    case 'Others':
      return <Package className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />;
  }
};

const getFrequencyBadgeColor = (frequency: string) => {
  switch (frequency) {
    case 'daily':
      return 'bg-info-muted text-info-foreground border-info/20';
    case 'weekly':
      return 'bg-accent-muted text-accent-foreground border-accent/20';
    case 'monthly':
      return 'bg-warning-muted text-warning-foreground border-warning/20';
    case 'yearly':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
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
  onMarkAsDone,
  isMarkingDone = false,
}) => {
  const isDone = transaction.status === 'done';

  return (
    <div className={`bg-card rounded-lg border p-6 hover:shadow-md transition-shadow ${isDone ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Icon, Title, and Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <RotateCcw className={`h-5 w-5 flex-shrink-0 ${isDone ? 'text-accent' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-semibold text-foreground truncate">{transaction.name}</h3>
            {isDone && (
              <Badge variant="outline" className="bg-accent-muted text-accent-foreground border-accent/20 flex-shrink-0">
                ✓ Done
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Next due: {format(parseLocalDate(transaction.next_due_date), 'MMM d, yyyy')}
            </p>
            <div className="flex items-center gap-2">
              {getCategoryIcon(transaction.category)}
              <span className="text-sm text-muted-foreground">Category: {transaction.category}</span>
            </div>
            {isDone && transaction.last_done_date && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-accent cursor-help">
                      Marked as done on {format(parseLocalDate(transaction.last_done_date), 'MM/dd/yyyy')}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This transaction was manually marked as completed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Right side - Amount, Frequency, and Actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">
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
            {!isDone && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMarkAsDone(transaction.id)}
                      disabled={isMarkingDone}
                      className="h-9 w-9 hover:bg-accent/20 rounded-full"
                      aria-label={`Mark ${transaction.name} as done`}
                    >
                      <Check className="h-4 w-4 text-accent" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Done</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(transaction)}
              className="h-9 w-9 hover:bg-muted rounded-full"
              aria-label={`Edit ${transaction.name} recurring transaction`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction.id)}
              className="h-9 w-9 hover:bg-destructive/10 rounded-full"
              aria-label={`Delete ${transaction.name} recurring transaction`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
