import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Due } from "@/types/due";
import {
  CheckCircle,
  Edit2,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DueCardProps {
  due: Due;
  onEdit: (due: Due) => void;
  onDelete: (id: string) => void;
  onMarkAsSettled?: (id: string) => void;
  variant?: "pending" | "settled";
}

const getCurrencySymbol = (currency: string) =>
  currency === "INR" ? "₹" : "$";

const formatCurrency = (amount: number, currency: string) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

const getDaysUntilDue = (dueDate?: string): number | null => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDueInfo = (dueDate?: string, status?: string) => {
  if (status === "Settled") {
    return {
      text: "Settled",
      className: "text-accent font-semibold",
      Icon: CheckCircle,
    };
  }

  const daysUntilDue = getDaysUntilDue(dueDate);

  if (daysUntilDue === null) {
    return {
      text: "No due date",
      className: "text-muted-foreground",
      Icon: Calendar,
    };
  }

  if (daysUntilDue < 0) {
    const days = Math.abs(daysUntilDue);
    return {
      text: `Overdue by ${days} day${days === 1 ? "" : "s"}`,
      className: "text-destructive font-semibold",
      Icon: AlertCircle,
    };
  }

  if (daysUntilDue === 0) {
    return {
      text: "Due today",
      className: "text-destructive font-semibold",
      Icon: Clock,
    };
  }

  if (daysUntilDue === 1) {
    return {
      text: "Due tomorrow",
      className: "text-warning font-semibold",
      Icon: Clock,
    };
  }

  if (daysUntilDue <= 7) {
    return {
      text: `Due in ${daysUntilDue} days`,
      className: "text-warning font-semibold",
      Icon: Calendar,
    };
  }

  return {
    text: `Due in ${daysUntilDue} days`,
    className: "text-muted-foreground",
    Icon: Calendar,
  };
};

export const DueCard: React.FC<DueCardProps> = ({
  due,
  onEdit,
  onDelete,
  onMarkAsSettled,
  variant = "pending",
}) => {
  const isIOwe = due.type === "I Owe";
  const isSettled = due.status === "Settled";
  const daysUntilDue = getDaysUntilDue(due.due_date);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && !isSettled;

  const dueInfo = getDueInfo(due.due_date, due.status);
  const DueIcon = dueInfo.Icon;

  // Card border styling based on state
  const getCardBorderClass = () => {
    if (isSettled) return "opacity-70";
    if (isOverdue) return "border-destructive/50 bg-destructive/5";
    return "";
  };

  // Type-based styling
  const getTypeStyle = () => {
    if (isIOwe) {
      return {
        badgeBg: "bg-destructive/10 border-destructive/20",
        badgeText: "text-destructive",
        amountColor: "text-destructive",
        iconBg: "bg-destructive/10 border-destructive/20",
        iconColor: "text-destructive",
      };
    }
    return {
      badgeBg: "bg-accent-muted border-accent/20",
      badgeText: "text-accent",
      amountColor: "text-accent",
      iconBg: "bg-accent-muted border-accent/20",
      iconColor: "text-accent",
    };
  };

  const typeStyle = getTypeStyle();

  return (
    <article
      className={cn(
        "bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        getCardBorderClass()
      )}
    >
      {/* Main Content */}
      <div className="p-4 space-y-3">
        {/* Top Row: Type Badge + Amount */}
        <div className="flex items-start justify-between">
          {/* Type Badge with Icon */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg border-2",
                typeStyle.iconBg
              )}
            >
              <User className={cn("h-5 w-5", typeStyle.iconColor)} />
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                typeStyle.badgeBg,
                typeStyle.badgeText
              )}
            >
              {isIOwe ? "I Owe" : "They Owe Me"}
            </Badge>
          </div>

          {/* Amount */}
          <span className={cn("text-2xl font-bold", typeStyle.amountColor)}>
            {formatCurrency(due.amount, due.currency)}
          </span>
        </div>

        {/* Person Name */}
        <div className="space-y-1">
          <h3
            className="text-base font-semibold text-foreground leading-tight truncate"
            title={due.person_name}
          >
            {due.person_name}
          </h3>
        </div>

        {/* Due Date Info */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          {/* Due info with urgency */}
          <div className={cn("flex items-center gap-1.5", dueInfo.className)}>
            <DueIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{dueInfo.text}</span>
          </div>

          {/* Settled date for settled dues */}
          {isSettled && due.settled_date && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs">
                Settled on {format(new Date(due.settled_date), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Full Date (only for pending dues with due date) */}
        {due.due_date && !isSettled && (
          <div className="text-lg font-medium text-foreground/80">
            {format(new Date(due.due_date), "EEEE - MMM d, yyyy")}
          </div>
        )}

        {/* Notes */}
        {due.notes && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {due.notes}
          </p>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex border-t bg-muted/20">
        {/* Mark as Settled button (only for pending dues) */}
        {variant === "pending" && onMarkAsSettled && !isSettled && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-12 rounded-none border-r hover:bg-emerald-50"
            onClick={() => onMarkAsSettled(due.id)}
          >
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-emerald-600">Settle</span>
          </Button>
        )}

        {/* Edit button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-12 rounded-none border-r hover:bg-primary/10"
          onClick={() => onEdit(due)}
        >
          <Edit2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">Edit</span>
        </Button>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-12 rounded-none hover:bg-destructive/10"
          onClick={() => onDelete(due.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="font-medium text-destructive">Delete</span>
        </Button>
      </div>
    </article>
  );
};

export default DueCard;
