import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Edit, Trash2, RotateCcw } from "lucide-react";
import { RecurringTransaction } from "@/types/recurringTransaction";
import { CURRENCIES } from "@/types/expense";
import { format } from "date-fns";

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onMarkAsDone: (id: string) => void;
  isMarkingDone?: boolean;
}

const getFrequencyBadgeColor = (frequency: string) => {
  switch (frequency) {
    case "daily":
      return "bg-blue-100 text-blue-700";
    case "weekly":
      return "bg-emerald-100 text-emerald-700";
    case "monthly":
      return "bg-violet-100 text-violet-700";
    case "yearly":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
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
  const isDone = transaction.status === "done";
  const notified = Boolean(transaction.last_reminder_sent_at);

  return (
    <article
      className={`rounded-2xl border border-muted-foreground/20 bg-white p-3.5 shadow-sm ${
        isDone ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-2xl bg-muted/70 p-2">
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {transaction.name}
              </h3>
              {isDone && (
                <Badge className="rounded-full bg-emerald-100 text-[11px] font-medium text-emerald-700">
                  Completed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Next due {format(new Date(transaction.next_due_date), "MMM d, yyyy")} • {transaction.category}
            </p>
            {notified && transaction.last_reminder_sent_at && (
              <p className="text-[11px] text-emerald-600">
                Notified at {format(new Date(transaction.last_reminder_sent_at), "MMM d, h:mm a")}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-foreground">
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>
          <Badge className={`mt-2 rounded-full px-2 py-1 text-[11px] font-medium ${getFrequencyBadgeColor(transaction.frequency)}`}>
            {transaction.frequency}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
            {transaction.email_reminder ? "Email reminders on" : "Reminders off"}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {!isDone && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-50"
              onClick={() => onMarkAsDone(transaction.id)}
              disabled={isMarkingDone}
              aria-label={`Mark ${transaction.name} as done`}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted/60"
            onClick={() => onEdit(transaction)}
            aria-label={`Edit ${transaction.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(transaction.id)}
            aria-label={`Delete ${transaction.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};
