import { addDays } from 'date-fns';
export const isWithinReminderWindow = (
  transaction: { next_due_date: string; reminder_days_before: number },
  today: Date,
  lookaheadDays: number
): boolean => {
  const dueDate = new Date(transaction.next_due_date);
  const reminderDate = addDays(dueDate, -transaction.reminder_days_before);
  const lookaheadLimit = addDays(today, lookaheadDays);

  return reminderDate <= today && dueDate <= lookaheadLimit;
};
