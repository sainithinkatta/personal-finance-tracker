import { parseLocalDate } from './dateUtils';
import { startOfDay } from 'date-fns';

export type ComputedStatus = 'upcoming' | 'pending' | 'done';

/**
 * Compute the status of a recurring transaction based on:
 * 1. If status === 'done' -> 'done' (completed takes priority)
 * 2. Else if due_date < today -> 'pending' (overdue)
 * 3. Else -> 'upcoming' (due today or in the future)
 * 
 * Uses user's local date for comparison (not UTC).
 */
export function computeRecurringStatus(
  dbStatus: string | null | undefined,
  nextDueDate: string | null | undefined
): ComputedStatus {
  // If marked as done in DB, it stays done
  if (dbStatus === 'done') {
    return 'done';
  }

  // Handle missing/invalid due date - default to upcoming
  if (!nextDueDate) {
    console.warn('Missing due date for recurring transaction, defaulting to upcoming');
    return 'upcoming';
  }

  try {
    // Parse the due date and get today's date at start of day (local time)
    const dueDate = startOfDay(parseLocalDate(nextDueDate));
    const today = startOfDay(new Date());

    // Compare at day level: due_date < today means pending (overdue)
    if (dueDate < today) {
      return 'pending';
    }

    // Due date is today or in the future
    return 'upcoming';
  } catch (error) {
    console.error('Error parsing due date:', nextDueDate, error);
    return 'upcoming';
  }
}

/**
 * Get display text for status
 */
export function getStatusDisplayText(status: ComputedStatus): string {
  switch (status) {
    case 'done':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'upcoming':
      return 'Upcoming';
    default:
      return 'Unknown';
  }
}

/**
 * Get status badge styling
 */
export function getStatusBadgeClass(status: ComputedStatus): string {
  switch (status) {
    case 'done':
      return 'bg-accent-muted text-accent-foreground border-accent/20';
    case 'pending':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'upcoming':
      return 'bg-info-muted text-info-foreground border-info/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}
