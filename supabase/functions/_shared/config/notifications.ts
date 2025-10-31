import { DEFAULT_REMINDER_LOOKAHEAD_DAYS, parseReminderLookaheadDays } from '../../../../config/notifications.ts';

export { DEFAULT_REMINDER_LOOKAHEAD_DAYS };

export const REMINDER_LOOKAHEAD_DAYS = parseReminderLookaheadDays(
  Deno.env.get('REMINDER_LOOKAHEAD_DAYS')
);
