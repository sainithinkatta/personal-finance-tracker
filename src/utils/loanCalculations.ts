import { format, addMonths, getDaysInMonth, startOfMonth, isLeapYear } from 'date-fns';
import { Loan, LoanContribution, MonthlyProjection } from '@/types/loan';

/**
 * Calculate monthly interest using reducing balance method
 * Interest is calculated on the current outstanding balance, not a fixed principal.
 * Formula: monthly_interest = currentOutstanding * (roi / 100) * (days_in_month / days_in_year)
 *
 * @param currentOutstanding - The outstanding balance at the start of the month
 * @param roi - Annual rate of interest as a percentage
 * @param daysInMonth - Number of days in the current month
 * @param monthDate - The date of the month being calculated (used for leap year detection)
 */
export const calculateMonthlyInterest = (
  currentOutstanding: number,
  roi: number,
  daysInMonth: number,
  monthDate: Date
): number => {
  // Edge case: If ROI is 0 or outstanding is 0/negative, no interest accrues
  if (roi <= 0 || currentOutstanding <= 0) return 0;

  // Use 366 days for leap years, 365 otherwise
  const daysInYear = isLeapYear(monthDate) ? 366 : 365;
  return currentOutstanding * (roi / 100) * (daysInMonth / daysInYear);
};

/**
 * Calculate the current outstanding balance after contributions.
 * 
 * Formula:
 * currentOutstanding = max(baseOutstanding - totalContributions, 0)
 * 
 * Only contributions made AFTER the reference date are counted.
 * 
 * @param loan - The loan with reference_outstanding and reference_date
 * @param contributions - Array of contributions made to this loan
 */
export const calculateCurrentOutstanding = (
  loan: Loan,
  contributions: LoanContribution[]
): number => {
  const refDate = new Date(loan.reference_date);
  
  // Sum contributions made after the reference date
  const totalContributions = contributions
    .filter(c => new Date(c.contribution_date) > refDate)
    .reduce((sum, c) => sum + c.amount, 0);
  
  // Current outstanding cannot go negative
  return Math.max(loan.reference_outstanding - totalContributions, 0);
};

/**
 * Generate a projection for a loan using REDUCING BALANCE method.
 * 
 * How it works:
 * - Starts with currentOutstanding (baseOutstanding - contributions)
 * - Interest for each month is calculated on the outstanding balance at the START of that month
 * - Interest accumulates and increases the outstanding balance each month
 * 
 * @param loan - The loan details (principal, ROI, reference outstanding, etc.)
 * @param contributions - Array of contributions made to this loan
 * @param monthsAhead - Number of months to project (default 6)
 */
export const generateProjection = (
  loan: Loan,
  contributions: LoanContribution[],
  monthsAhead: number = 6
): MonthlyProjection[] => {
  const projections: MonthlyProjection[] = [];
  
  // Start with current outstanding (after contributions)
  const referenceDate = new Date(loan.reference_date);
  let currentOutstanding = calculateCurrentOutstanding(loan, contributions);
  
  // Edge case: If outstanding is 0 or negative, projection shows all zeros
  if (currentOutstanding <= 0) {
    let currentMonth = startOfMonth(addMonths(referenceDate, 1));
    for (let i = 0; i < monthsAhead; i++) {
      projections.push({
        month: format(currentMonth, 'MMM yyyy'),
        monthStart: currentMonth,
        daysInMonth: getDaysInMonth(currentMonth),
        openingBalance: 0,
        interestAdded: 0,
        closingBalance: 0,
      });
      currentMonth = addMonths(currentMonth, 1);
    }
    return projections;
  }
  
  // Start from the month after reference date
  let currentMonth = startOfMonth(addMonths(referenceDate, 1));
  
  for (let i = 0; i < monthsAhead; i++) {
    const daysInCurrentMonth = getDaysInMonth(currentMonth);
    const openingBalance = currentOutstanding;
    
    // REDUCING BALANCE: Interest calculated on current outstanding
    // Interest varies each month based on actual balance
    const interestAdded = calculateMonthlyInterest(
      openingBalance,
      loan.roi,
      daysInCurrentMonth,
      currentMonth
    );
    
    // Closing balance = Opening + Interest (no inline payments anymore)
    const closingBalance = openingBalance + interestAdded;
    
    projections.push({
      month: format(currentMonth, 'MMM yyyy'),
      monthStart: currentMonth,
      daysInMonth: daysInCurrentMonth,
      openingBalance: Math.round(openingBalance * 100) / 100,
      interestAdded: Math.round(interestAdded * 100) / 100,
      closingBalance: Math.round(closingBalance * 100) / 100,
    });
    
    // Update outstanding for next month
    currentOutstanding = closingBalance;
    currentMonth = addMonths(currentMonth, 1);
  }
  
  return projections;
};

/**
 * Calculate total interest over the projection window
 */
export const calculateTotalInterest = (projections: MonthlyProjection[]): number => {
  return projections.reduce((sum, p) => sum + p.interestAdded, 0);
};

/**
 * Calculate net change in outstanding (always positive when there are no payments)
 */
export const calculateNetChange = (projections: MonthlyProjection[]): number => {
  if (projections.length === 0) return 0;
  const firstOpening = projections[0].openingBalance;
  const lastClosing = projections[projections.length - 1].closingBalance;
  return lastClosing - firstOpening;
};

/**
 * Format currency amount
 */
export const formatLoanCurrency = (amount: number, currency: string): string => {
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })}`;
};
