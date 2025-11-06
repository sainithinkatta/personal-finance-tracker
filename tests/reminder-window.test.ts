import { strict as assert } from 'node:assert';
import { addDays, subDays } from 'date-fns';
import { isWithinReminderWindow } from '../src/lib/reminders.js';

type TransactionStub = {
  next_due_date: string;
  reminder_days_before: number;
};

const LOOKAHEAD_DAYS = 7;

const createTransaction = (dueDate: Date, reminderDaysBefore: number): TransactionStub => ({
  next_due_date: dueDate.toISOString(),
  reminder_days_before: reminderDaysBefore,
});

const today = new Date('2024-01-15T00:00:00.000Z');

(() => {
  const dueDate = addDays(today, 3);
  const transaction = createTransaction(dueDate, 5);

  assert.equal(
    isWithinReminderWindow(transaction, today, LOOKAHEAD_DAYS),
    true,
    'Transactions with past reminder dates inside the horizon should be included'
  );
})();

(() => {
  const dueDate = addDays(today, LOOKAHEAD_DAYS + 1);
  const transaction = createTransaction(dueDate, 1);

  assert.equal(
    isWithinReminderWindow(transaction, today, LOOKAHEAD_DAYS),
    false,
    'Transactions beyond the lookahead horizon should be excluded'
  );
})();

(() => {
  const dueDate = today;
  const transaction = createTransaction(dueDate, 0);

  assert.equal(
    isWithinReminderWindow(transaction, today, LOOKAHEAD_DAYS),
    true,
    'Same-day reminders are supported'
  );
})();

(() => {
  const dueDate = addDays(today, 3);
  const transaction = createTransaction(dueDate, 2);

  assert.equal(
    isWithinReminderWindow(transaction, today, LOOKAHEAD_DAYS),
    false,
    'Reminder should not trigger before reminder offset'
  );
})();

(() => {
  const overdueDate = subDays(today, 1);
  const transaction = createTransaction(overdueDate, 2);

  assert.equal(
    isWithinReminderWindow(transaction, today, LOOKAHEAD_DAYS),
    true,
    'Overdue transactions remain in the reminder window'
  );
})();

console.log('Reminder window tests passed');
