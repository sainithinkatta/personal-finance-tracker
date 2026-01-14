/**
 * =====================================================
 * RECURRING CARD COMPONENT
 * =====================================================
 * 
 * Unified card component for displaying recurring transactions/plans.
 * Used in Upcoming, Active Plans tabs with consistent visual design.
 * 
 * Layout (matching target sketch):
 * - Top: Category pill (left) + Amount (right)
 * - Middle: Title, Bank + Due info + Frequency, Full date
 * - Bottom: Action buttons row
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';
import { ExpenseCategory } from '@/types/expense';
import {
    Check,
    Pause,
    Play,
    Edit,
    Building2,
    Calendar,
    Clock,
    AlertCircle,
    SkipForward,
} from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

export interface RecurringCardProps {
    name: string;
    category: ExpenseCategory;
    bankName: string;
    amount: number;
    currency: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDueDate: string;
    daysUntilDue: number;

    // State flags
    isPaused?: boolean;
    isPaid?: boolean;
    isOverdue?: boolean;

    // Action callbacks
    onMarkAsPaid?: () => void;
    onPauseToggle?: () => void;
    onEdit?: () => void;
    onSkip?: () => void;

    // Loading states
    isMarkingPaid?: boolean;
    isPausingResuming?: boolean;
    isSkipping?: boolean;

    // Variant for different contexts
    variant?: 'upcoming' | 'active';
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

const formatCurrency = (amount: number, currency: string) => {
    return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
};

const getCategoryStyle = (category: string) => {
    switch (category) {
        case 'Bills':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'Groceries':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'Food':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        case 'Travel':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        default:
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    }
};

const getFrequencyStyle = (frequency: string) => {
    switch (frequency) {
        case 'daily':
            return 'bg-info-muted text-info-foreground';
        case 'weekly':
            return 'bg-accent-muted text-accent-foreground';
        case 'monthly':
            return 'bg-warning-muted text-warning-foreground';
        case 'yearly':
            return 'bg-primary/10 text-primary';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

const getDueInfo = (daysUntilDue: number, isPaused?: boolean, isPaid?: boolean) => {
    if (isPaid) {
        return {
            text: 'Paid',
            className: 'text-accent font-semibold',
            Icon: Check,
        };
    }

    if (isPaused) {
        return {
            text: 'Paused',
            className: 'text-muted-foreground',
            Icon: Pause,
        };
    }

    if (daysUntilDue < 0) {
        const days = Math.abs(daysUntilDue);
        return {
            text: `Overdue by ${days} day${days === 1 ? '' : 's'}`,
            className: 'text-destructive font-semibold',
            Icon: AlertCircle,
        };
    }

    if (daysUntilDue === 0) {
        return {
            text: 'Due today',
            className: 'text-destructive font-semibold',
            Icon: Clock,
        };
    }

    if (daysUntilDue === 1) {
        return {
            text: 'Due tomorrow',
            className: 'text-warning font-semibold',
            Icon: Clock,
        };
    }

    if (daysUntilDue <= 7) {
        return {
            text: `Due in ${daysUntilDue} days`,
            className: 'text-warning font-semibold',
            Icon: Calendar,
        };
    }

    return {
        text: `Due in ${daysUntilDue} days`,
        className: 'text-muted-foreground',
        Icon: Calendar,
    };
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const RecurringCard: React.FC<RecurringCardProps> = ({
    name,
    category,
    bankName,
    amount,
    currency,
    frequency,
    nextDueDate,
    daysUntilDue,
    isPaused = false,
    isPaid = false,
    isOverdue = false,
    onMarkAsPaid,
    onPauseToggle,
    onEdit,
    onSkip,
    isMarkingPaid = false,
    isPausingResuming = false,
    isSkipping = false,
    variant = 'upcoming',
}) => {
    const dueDate = parseLocalDate(nextDueDate);
    const dueInfo = getDueInfo(daysUntilDue, isPaused, isPaid);
    const DueIcon = dueInfo.Icon;

    // Card border styling based on state
    const getCardBorderClass = () => {
        if (isPaid) return 'border-accent/50 bg-accent/5';
        if (isOverdue) return 'border-destructive/50 bg-destructive/5';
        if (isPaused) return 'border-warning/30 bg-warning/5';
        return '';
    };

    return (
        <article
            className={`bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${getCardBorderClass()}`}
        >
            {/* Main Content */}
            <div className="p-4 space-y-3">
                {/* Top Row: Category Pill + Amount */}
                <div className="flex items-start justify-between gap-2">
                    <Badge
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryStyle(category)}`}
                    >
                        {category}
                    </Badge>
                    <span className="text-2xl font-bold text-foreground">
                        {formatCurrency(amount, currency)}
                    </span>
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground leading-tight line-clamp-2">
                        {name}
                    </h3>
                    {isPaused && (
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                            <Pause className="h-3 w-3 mr-1" />
                            Paused
                        </Badge>
                    )}
                </div>

                {/* Bank + Due + Frequency Row */}
                <div className="flex items-center gap-3 flex-wrap text-sm">
                    {/* Bank */}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[80px]">{bankName}</span>
                    </div>

                    {/* Due info */}
                    <div className={`flex items-center gap-1.5 ${dueInfo.className}`}>
                        <DueIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{dueInfo.text}</span>
                    </div>

                    {/* Frequency */}
                    <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${getFrequencyStyle(frequency)}`}
                    >
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Badge>
                </div>

                {/* Full Date */}
                <div className="text-lg font-medium text-foreground/80">
                    {format(dueDate, 'EEEE, MMM d, yyyy')}
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex border-t bg-muted/20">
                {/* Mark as Paid / Paid button */}
                {variant === 'upcoming' && onMarkAsPaid && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-12 rounded-none border-r hover:bg-emerald-50 ${isPaid ? 'bg-emerald-50' : ''
                            }`}
                        onClick={onMarkAsPaid}
                        disabled={isPaid || isMarkingPaid}
                    >
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-600">
                            {isPaid ? 'Paid' : 'Mark as paid'}
                        </span>
                    </Button>
                )}


                {/* Pause/Resume button */}
                {onPauseToggle && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-12 rounded-none border-r hover:bg-warning/10"
                        onClick={onPauseToggle}
                        disabled={isPausingResuming}
                    >
                        {isPaused ? (
                            <>
                                <Play className="h-4 w-4 text-accent" />
                                <span className="font-medium text-accent">Resume</span>
                            </>
                        ) : (
                            <>
                                <Pause className="h-4 w-4 text-warning" />
                                <span className="font-medium text-warning">Pause</span>
                            </>
                        )}
                    </Button>
                )}

                {/* Skip button (Upcoming only) */}
                {variant === 'upcoming' && onSkip && !isPaid && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-12 rounded-none border-r hover:bg-muted"
                        onClick={onSkip}
                        disabled={isSkipping}
                    >
                        <SkipForward className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Skip</span>
                    </Button>
                )}

                {/* Edit button */}
                {onEdit && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-12 rounded-none hover:bg-primary/10"
                        onClick={onEdit}
                    >
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Edit</span>
                    </Button>
                )}
            </div>
        </article>
    );
};
