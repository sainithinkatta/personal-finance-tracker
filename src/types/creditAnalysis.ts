/**
 * Credit Analysis Types
 * 
 * Shared types for the credit card payoff planner and analysis features.
 * These types are used across components and utility functions.
 */

/**
 * Represents a credit card for payoff calculations.
 * 
 * IMPORTANT: `balance` represents the OUTSTANDING DEBT (amount owed),
 * NOT the credit limit. This is derived from:
 * 1. `due_balance` if available
 * 2. Otherwise: `credit_limit - available_balance`
 * 
 * This ensures payoff calculations work on actual debt, not credit lines.
 */
export interface CreditCard {
  id: string;
  name: string;
  /** Outstanding debt amount (what you owe, not credit limit) */
  balance: number;
  /** Annual Percentage Rate (0 is valid for promo/no-interest cards) */
  apr: number;
  /** Required minimum monthly payment */
  minimumPayment: number;
  /** Currency code (e.g., 'USD', 'INR') */
  currency: string;
  /** True if APR was provided (false means null/undefined in source data) */
  aprProvided: boolean;
  /** True if minimum payment was provided (false means null/undefined in source data) */
  minimumPaymentProvided: boolean;
}

/**
 * Payment details for a single card in a given month
 */
export interface MonthlyPayment {
  cardId: string;
  cardName: string;
  /** Total payment made this month */
  payment: number;
  /** Portion of payment that went to interest */
  interestPaid: number;
  /** Portion of payment that reduced principal */
  principalPaid: number;
  /** Balance remaining after this month's payment */
  remainingBalance: number;
}

/**
 * Complete breakdown for a single month across all cards
 */
export interface MonthlyBreakdown {
  month: number;
  payments: MonthlyPayment[];
  totalPayment: number;
  totalInterest: number;
  totalRemaining: number;
}

/**
 * Complete result of a payoff simulation
 */
export interface PayoffResult {
  timeline: MonthlyBreakdown[];
  totalMonths: number;
  totalInterestPaid: number;
  totalPaid: number;
  /** Card IDs in order they were paid off */
  payoffOrder: string[];
  /** Whether debt can be paid off with current payments */
  isPayoffPossible: boolean;
  /** 
   * True if total payments are less than monthly interest accrual.
   * When true, debt will grow over time instead of shrinking.
   */
  negativeAmortization?: boolean;
  /**
   * If negativeAmortization is true, this is the minimum extra payment
   * needed to start making progress on debt.
   */
  minimumExtraRequired?: number;
}

/**
 * Payoff strategy options
 * - avalanche: Pay highest APR cards first (saves most on interest)
 * - snowball: Pay lowest balance first (quick psychological wins)
 */
export type PayoffStrategy = 'avalanche' | 'snowball';

/**
 * Summary statistics for a set of credit cards
 */
export interface CreditSummary {
  totalBalance: number;
  totalMinimumPayments: number;
  /** Weighted average APR (weighted by balance) */
  weightedAverageApr: number;
  /** Simple average APR (for backwards compatibility) */
  averageApr: number;
  cardCount: number;
  /** True if any card is missing APR or minimum payment */
  hasMissingData: boolean;
  /** IDs of cards missing APR */
  cardsMissingApr: string[];
  /** IDs of cards missing minimum payment */
  cardsMissingMinPayment: string[];
}
