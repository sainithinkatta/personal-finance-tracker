import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Check, AlertCircle, Building2 } from 'lucide-react';
import { RecurringTransactionWithStatus } from '@/hooks/useRecurringTransactions';
import { format, differenceInDays } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { BankAccount } from '@/types/bankAccount';
import { getStatusDisplayText, getStatusBadgeClass } from '@/utils/recurringStatusUtils';

interface RecurringTransactionCardProps {
  transaction: RecurringTransactionWithStatus;
  onEdit: (transaction: RecurringTransactionWithStatus) => void;
  onDelete: (id: string) => void;
  onMarkAsDone: () => void;
  isMarkingDone?: boolean;
  bankAccounts?: BankAccount[];
}

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

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

const formatCurrency = (amount: number, currency: string) => {
  return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
};

export const RecurringTransactionCard: React.FC<RecurringTransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  onMarkAsDone,
  isMarkingDone = false,
  bankAccounts = [],
}) => {
  // Use computed status instead of DB status
  const computedStatus = transaction.computedStatus;
  const isDone = computedStatus === 'done';
  const isPending = computedStatus === 'pending';

  const dueDate = parseLocalDate(transaction.next_due_date);
  const daysUntilDue = differenceInDays(dueDate, new Date());

  // Find the bank account name
  const bankAccount = bankAccounts.find(ba => ba.id === transaction.bank_account_id);
  const bankName = bankAccount?.name || 'No bank assigned';

  const getDueText = () => {
    if (isDone) {
      return 'Completed';
    }
    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`;
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
    }
  };

  const getDueColorClass = () => {
    if (isDone) {
      return 'text-accent font-semibold';
    }
    if (daysUntilDue < 0) {
      return 'text-destructive font-semibold'; // Red for overdue
    } else if (daysUntilDue <= 1) {
      return 'text-destructive font-semibold'; // Red for today/tomorrow
    } else if (daysUntilDue <= 7) {
      return 'text-warning font-semibold'; // Yellow for 2-7 days
    } else {
      return 'text-muted-foreground'; // Gray for 8+ days
    }
  };

  return (
    <article className={`bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isDone ? 'opacity-75' : ''}`}>
      {/* Main Content */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Date Section - Calendar Style */}
          <div className={`flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-xl border ${isDone
              ? 'bg-accent-muted/50 border-accent/20'
              : isPending
                ? 'bg-destructive/10 border-destructive/20'
                : 'bg-gradient-to-br from-info-muted to-info-muted/50 border-info/20'
            }`}>
            <div className="text-2xl font-bold text-foreground leading-none">
              {format(dueDate, 'dd')}
            </div>
            <div className={`text-xs font-semibold uppercase mt-0.5 ${isDone ? 'text-accent' : isPending ? 'text-destructive' : 'text-info-foreground'
              }`}>
              {format(dueDate, 'MMM')}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {format(dueDate, 'EEE')}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Amount, Category and Frequency Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={`font-semibold text-xs px-3 py-1 rounded-lg ${transaction.category === 'Groceries' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      transaction.category === 'Food' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                        transaction.category === 'Travel' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                          transaction.category === 'Bills' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                            transaction.category === 'Others' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                              'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {transaction.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-0.5 rounded-full ${getFrequencyBadgeColor(transaction.frequency)}`}
                >
                  {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                </Badge>
              </div>
              <div className="text-xl font-bold text-foreground whitespace-nowrap">
                {formatCurrency(transaction.amount, transaction.currency)}
              </div>
            </div>

            {/* Transaction Name */}
            <div
              className="text-sm text-foreground/80 leading-relaxed truncate"
              title={transaction.name}
            >
              {transaction.name}
            </div>

            {/* Bank Account Info */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{bankName}</span>
            </div>

            {/* Status and Due Date */}
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`text-xs ${getStatusBadgeClass(computedStatus)}`}
              >
                {isPending && <AlertCircle className="h-3 w-3 mr-1" />}
                {isDone && <Check className="h-3 w-3 mr-1" />}
                {getStatusDisplayText(computedStatus)}
              </Badge>

              <span className={`text-xs flex items-center gap-1 ${getDueColorClass()}`}>
                {getDueText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center border-t bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 rounded-none hover:bg-primary/10 flex items-center justify-center gap-2 touch-target transition-colors border-r"
          onClick={() => onEdit(transaction)}
        >
          <Edit className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Edit</span>
        </Button>

        {!isDone && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-11 rounded-none hover:bg-accent/10 flex items-center justify-center gap-2 touch-target transition-colors border-r"
            onClick={onMarkAsDone}
            disabled={isMarkingDone}
          >
            <Check className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Done</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 rounded-none hover:bg-destructive/10 flex items-center justify-center gap-2 touch-target transition-colors"
          onClick={() => onDelete(transaction.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Delete</span>
        </Button>
      </div>
    </article>
  );
};
