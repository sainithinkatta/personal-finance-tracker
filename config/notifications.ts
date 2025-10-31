export const DEFAULT_REMINDER_LOOKAHEAD_DAYS = 7;

export const parseReminderLookaheadDays = (value?: string | null): number => {
  if (!value) {
    return DEFAULT_REMINDER_LOOKAHEAD_DAYS;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_REMINDER_LOOKAHEAD_DAYS;
  }

  return parsed;
};
