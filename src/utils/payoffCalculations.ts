/**
 * Credit Card Payoff Calculations
 * 
 * This module provides utilities for calculating credit card debt payoff
 * timelines using different strategies (avalanche, snowball).
 * 
 * DISCLAIMER: These calculations use a simplified monthly interest model
 * for planning purposes. Real credit card issuers may use daily average
 * balance methods, which can result in different actual interest charges.
 * All numbers are ESTIMATES for planning purposes only.
 * 
 * NOTE ON MULTI-CURRENCY: Currently, this module operates on cards of a
 * single currency at a time. Multi-currency support would require FX
 * conversion rates or separate per-currency summaries.
 */

import { BankAccount } from '@/types/bankAccount';
import {
  CreditCard,
  MonthlyPayment,
  MonthlyBreakdown,
  PayoffResult,
  PayoffStrategy,
  CreditSummary,
} from '@/types/creditAnalysis';

// Re-export types for backwards compatibility
export type { CreditCard, MonthlyPayment, MonthlyBreakdown, PayoffResult, PayoffStrategy, CreditSummary };

/**
 * Convert credit bank accounts to CreditCard format for calculations.
 * 
 * BALANCE DERIVATION:
 * - `balance` = outstanding debt (what you owe)
 * - Primary source: `due_balance` field
 * - Fallback: `credit_limit - available_balance`
 * - This ensures we calculate payoff on actual debt, not credit limits
 * 
 * @param accounts - Array of bank accounts
 * @param currency - Optional currency filter. If provided, only cards matching this currency are returned.
 * @returns Array of CreditCard objects with positive balances
 */
export function bankAccountsToCreditCards(
  accounts: BankAccount[],
  currency?: string
): CreditCard[] {
  return accounts
    .filter(acc => acc.account_type === 'Credit')
    .filter(acc => !currency || acc.currency === currency)
    .map(acc => ({
      id: acc.id,
      name: acc.name || 'Unnamed Card',
      // Balance = outstanding debt (due_balance or derived from limit - available)
      balance: acc.due_balance ?? 
        (acc.credit_limit && acc.available_balance != null 
          ? acc.credit_limit - acc.available_balance 
          : 0),
      // APR of 0 is valid (promo rate / no interest). Only null/undefined is "missing"
      apr: acc.apr ?? 0,
      minimumPayment: acc.minimum_payment ?? 0,
      currency: acc.currency || 'USD',
      // Track whether values were actually provided vs defaulted
      aprProvided: acc.apr != null,
      minimumPaymentProvided: acc.minimum_payment != null && acc.minimum_payment > 0,
    }))
    .filter(card => card.balance > 0);
}

/**
 * Sort cards based on payoff strategy.
 * 
 * Uses deterministic tie-breakers to ensure consistent ordering:
 * - Avalanche: APR desc → balance desc → id asc
 * - Snowball: balance asc → APR desc → id asc
 * 
 * @param cards - Credit cards to sort
 * @param strategy - Payoff strategy
 * @returns Sorted copy of cards array
 */
function sortByStrategy(cards: CreditCard[], strategy: PayoffStrategy): CreditCard[] {
  return [...cards].sort((a, b) => {
    if (strategy === 'avalanche') {
      // Highest APR first, then higher balance, then id for determinism
      if (b.apr !== a.apr) return b.apr - a.apr;
      if (b.balance !== a.balance) return b.balance - a.balance;
      return a.id.localeCompare(b.id);
    } else {
      // Snowball: Lowest balance first, then higher APR, then id for determinism
      if (a.balance !== b.balance) return a.balance - b.balance;
      if (b.apr !== a.apr) return b.apr - a.apr;
      return a.id.localeCompare(b.id);
    }
  });
}

/**
 * Calculate total monthly interest across all cards at current balances.
 * Uses simplified monthly interest: balance × (APR / 100) / 12
 */
function calculateTotalMonthlyInterest(cards: CreditCard[]): number {
  return cards.reduce((total, card) => {
    const monthlyRate = (card.apr / 100) / 12;
    return total + (card.balance * monthlyRate);
  }, 0);
}

/**
 * Run payoff simulation using specified strategy.
 * 
 * INTEREST MODEL:
 * This uses a simplified monthly interest approximation:
 *   monthlyInterest = balance × (APR / 100) / 12
 * 
 * Real credit card issuers may use daily average balance method,
 * which can result in different actual interest charges.
 * All numbers are ESTIMATES for planning purposes only.
 * 
 * NEGATIVE AMORTIZATION DETECTION:
 * Before running the simulation, we check if total payments (minimums + extra)
 * are less than total monthly interest. If so, debt will grow and payoff is
 * not possible under the current plan.
 * 
 * @param creditCards - Array of credit cards
 * @param strategy - Payoff strategy ('avalanche' or 'snowball')
 * @param extraPayment - Additional monthly payment beyond minimums
 * @param maxMonths - Safety limit for simulation (default: 600)
 * @returns Complete payoff result with timeline
 */
export function calculatePayoff(
  creditCards: CreditCard[],
  strategy: PayoffStrategy,
  extraPayment: number = 0,
  maxMonths: number = 600
): PayoffResult {
  if (creditCards.length === 0) {
    return {
      timeline: [],
      totalMonths: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffOrder: [],
      isPayoffPossible: true,
      negativeAmortization: false,
    };
  }

  // Calculate total payment capacity
  const totalMinimumPayments = creditCards.reduce((sum, c) => sum + c.minimumPayment, 0);
  const totalPaymentCapacity = totalMinimumPayments + extraPayment;
  
  // Check for negative amortization (payments < interest)
  const totalMonthlyInterest = calculateTotalMonthlyInterest(creditCards);
  
  if (totalPaymentCapacity < totalMonthlyInterest) {
    // Debt will grow - payoff not possible
    const minimumExtraRequired = Math.ceil((totalMonthlyInterest - totalMinimumPayments + 0.01) * 100) / 100;
    return {
      timeline: [],
      totalMonths: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffOrder: [],
      isPayoffPossible: false,
      negativeAmortization: true,
      minimumExtraRequired: Math.max(0, minimumExtraRequired),
    };
  }

  // Clone cards for simulation
  let cards = creditCards.map(c => ({ ...c }));
  const timeline: MonthlyBreakdown[] = [];
  const payoffOrder: string[] = [];
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;

  // Get total minimums at start (for rollover calculation)
  const initialTotalMinimums = cards.reduce((sum, c) => sum + c.minimumPayment, 0);

  while (cards.some(c => c.balance > 0) && month < maxMonths) {
    month++;
    const monthPayments: MonthlyPayment[] = [];
    let monthTotalPayment = 0;
    let monthTotalInterest = 0;

    // Sort remaining cards by strategy
    const sortedCards = sortByStrategy(cards.filter(c => c.balance > 0), strategy);
    const targetCardId = sortedCards[0]?.id;

    // Calculate freed up minimums from paid off cards (rollover)
    const currentTotalMinimums = cards
      .filter(c => c.balance > 0)
      .reduce((sum, c) => sum + c.minimumPayment, 0);
    const freedMinimums = initialTotalMinimums - currentTotalMinimums;
    const effectiveExtra = extraPayment + freedMinimums;

    for (const card of cards) {
      if (card.balance <= 0) continue;

      // Step 1: Calculate interest (simplified monthly approximation)
      const monthlyRate = (card.apr / 100) / 12;
      const interest = card.balance * monthlyRate;
      
      // Step 2: Add interest to balance
      card.balance += interest;
      totalInterestPaid += interest;
      monthTotalInterest += interest;

      // Step 3: Apply payments
      let payment = Math.min(card.minimumPayment, card.balance);
      
      // Add extra payment to target card
      if (card.id === targetCardId) {
        payment = Math.min(payment + effectiveExtra, card.balance);
      }

      const principalPaid = Math.max(0, payment - interest);
      card.balance -= payment;
      
      // Round balance to 2 decimals and clamp negative to zero
      card.balance = Math.round(card.balance * 100) / 100;
      if (card.balance < 0.01) {
        card.balance = 0;
        if (!payoffOrder.includes(card.id)) {
          payoffOrder.push(card.id);
        }
      }

      monthPayments.push({
        cardId: card.id,
        cardName: card.name,
        payment: Math.round(payment * 100) / 100,
        interestPaid: Math.round(interest * 100) / 100,
        principalPaid: Math.round(principalPaid * 100) / 100,
        remainingBalance: Math.max(0, card.balance),
      });

      monthTotalPayment += payment;
      totalPaid += payment;
    }

    timeline.push({
      month,
      payments: monthPayments,
      totalPayment: Math.round(monthTotalPayment * 100) / 100,
      totalInterest: Math.round(monthTotalInterest * 100) / 100,
      totalRemaining: Math.round(cards.reduce((sum, c) => sum + Math.max(0, c.balance), 0) * 100) / 100,
    });
  }

  const isPayoffPossible = month < maxMonths;

  return {
    timeline,
    totalMonths: month,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    payoffOrder,
    isPayoffPossible,
    negativeAmortization: false,
  };
}

/**
 * Calculate required extra payment to pay off in N months using binary search.
 * 
 * @param creditCards - Array of credit cards
 * @param strategy - Payoff strategy
 * @param targetMonths - Target number of months to be debt-free
 * @returns Required extra monthly payment (on top of minimums)
 */
export function calculateRequiredExtraForGoal(
  creditCards: CreditCard[],
  strategy: PayoffStrategy,
  targetMonths: number
): number {
  if (creditCards.length === 0) return 0;

  const totalBalance = creditCards.reduce((sum, c) => sum + c.balance, 0);
  
  // Binary search for required extra payment
  let low = 0;
  let high = totalBalance; // Max would be paying it all in one month
  let result = high;

  for (let i = 0; i < 50; i++) { // 50 iterations is enough precision
    const mid = (low + high) / 2;
    const payoff = calculatePayoff(creditCards, strategy, mid, targetMonths + 10);
    
    if (payoff.totalMonths <= targetMonths && payoff.isPayoffPossible) {
      result = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.ceil(result * 100) / 100; // Round up to 2 decimals
}

/**
 * Get summary statistics for credit cards.
 * 
 * Uses weighted average APR (weighted by balance) for more accurate
 * representation of overall interest burden.
 * 
 * @param creditCards - Array of credit cards
 * @returns Summary statistics including missing data flags
 */
export function getCreditSummary(creditCards: CreditCard[]): CreditSummary {
  const totalBalance = creditCards.reduce((sum, c) => sum + c.balance, 0);
  const totalMinimumPayments = creditCards.reduce((sum, c) => sum + c.minimumPayment, 0);
  
  // Simple average APR (for backwards compatibility)
  // Note: 0% APR is valid - only exclude cards with truly missing APR from average
  const cardsWithApr = creditCards.filter(c => c.aprProvided);
  const averageApr = cardsWithApr.length > 0 
    ? cardsWithApr.reduce((sum, c) => sum + c.apr, 0) / cardsWithApr.length 
    : 0;
  
  // Weighted average APR (weighted by balance - more accurate representation)
  // Only consider cards with APR provided
  const totalBalanceWithApr = cardsWithApr.reduce((sum, c) => sum + c.balance, 0);
  const weightedAverageApr = totalBalanceWithApr > 0
    ? cardsWithApr.reduce((sum, c) => sum + (c.apr * c.balance), 0) / totalBalanceWithApr
    : 0;

  // Check for missing data - use the provided flags, NOT apr === 0
  // APR of 0 is valid (promo rate). Only flag cards where APR was never set (null/undefined)
  const cardsMissingApr = creditCards.filter(c => !c.aprProvided).map(c => c.id);
  const cardsMissingMinPayment = creditCards.filter(c => !c.minimumPaymentProvided).map(c => c.id);
  const hasMissingData = cardsMissingApr.length > 0 || cardsMissingMinPayment.length > 0;

  return {
    totalBalance,
    totalMinimumPayments,
    averageApr,
    weightedAverageApr,
    cardCount: creditCards.length,
    hasMissingData,
    cardsMissingApr,
    cardsMissingMinPayment,
  };
}
