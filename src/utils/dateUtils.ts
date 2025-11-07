/**
 * Parses a date-only string (YYYY-MM-DD) without timezone conversion.
 *
 * When you use `new Date('2025-11-11')`, JavaScript treats it as midnight UTC.
 * If the user is in a timezone behind UTC (e.g., PST = UTC-8), this converts
 * to the previous day (2025-11-10 at 4 PM PST).
 *
 * This function appends 'T00:00:00' to force the date to be interpreted in the
 * local timezone, preventing the off-by-1 day bug.
 *
 * @param dateString - ISO date string in YYYY-MM-DD format
 * @returns Date object representing midnight in the local timezone
 *
 * @example
 * // User in PST (UTC-8)
 * new Date('2025-11-11')        // 2025-11-10T16:00:00-08:00 (wrong day!)
 * parseLocalDate('2025-11-11')  // 2025-11-11T00:00:00-08:00 (correct!)
 */
export function parseLocalDate(dateString: string): Date {
  // If the string already has a time component, use it as-is
  if (dateString.includes('T') || dateString.includes(' ')) {
    return new Date(dateString);
  }

  // Append T00:00:00 to force local timezone interpretation
  return new Date(dateString + 'T00:00:00');
}
