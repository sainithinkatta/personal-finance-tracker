
import { BankAccount } from '@/types/bankAccount';

export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  currency: string;
}

export interface MonthlyPayment {
  cardId: string;
  cardName: string;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

export interface MonthlyBreakdown {
  month: number;
  payments: MonthlyPayment[];
  totalPayment: number;
  totalInterest: number;
  totalRemaining: number;
}

export interface PayoffResult {
  timeline: MonthlyBreakdown[];
  totalMonths: number;
  totalInterestPaid: number;
  totalPaid: number;
  payoffOrder: string[];
  isPayoffPossible: boolean;
}

export type PayoffStrategy = 'avalanche' | 'snowball';

/**
 * Convert credit bank accounts to CreditCard format for calculations
 */
export function bankAccountsToCreditCards(accounts: BankAccount[]): CreditCard[] {
  return accounts
    .filter(acc => acc.account_type === 'Credit')
    .map(acc => ({
      id: acc.id,
      name: acc.name,
      balance: acc.due_balance ?? (acc.credit_limit ? acc.credit_limit - (acc.available_balance ?? 0) : 0),
      apr: acc.apr ?? 0,
      minimumPayment: acc.minimum_payment ?? 0,
      currency: acc.currency,
    }))
    .filter(card => card.balance > 0);
}

/**
 * Sort cards based on strategy
 */
function sortByStrategy(cards: CreditCard[], strategy: PayoffStrategy): CreditCard[] {
  return [...cards].sort((a, b) => {
    if (strategy === 'avalanche') {
      // Highest APR first, then higher balance as tiebreaker
      if (b.apr !== a.apr) return b.apr - a.apr;
      return b.balance - a.balance;
    } else {
      // Snowball: Lowest balance first, then higher APR as tiebreaker
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.apr - a.apr;
    }
  });
}

/**
 * Run payoff simulation
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
    };
  }

  // Clone cards for simulation
  let cards = creditCards.map(c => ({ ...c }));
  const timeline: MonthlyBreakdown[] = [];
  const payoffOrder: string[] = [];
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;
  let availableExtra = extraPayment;

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

      // Step 1: Calculate interest
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

      const principalPaid = payment - interest;
      card.balance -= payment;
      
      // Handle floating point errors
      if (card.balance < 0.01) {
        card.balance = 0;
        if (!payoffOrder.includes(card.id)) {
          payoffOrder.push(card.id);
        }
      }

      monthPayments.push({
        cardId: card.id,
        cardName: card.name,
        payment,
        interestPaid: interest,
        principalPaid: Math.max(0, principalPaid),
        remainingBalance: Math.max(0, card.balance),
      });

      monthTotalPayment += payment;
      totalPaid += payment;
    }

    timeline.push({
      month,
      payments: monthPayments,
      totalPayment: monthTotalPayment,
      totalInterest: monthTotalInterest,
      totalRemaining: cards.reduce((sum, c) => sum + Math.max(0, c.balance), 0),
    });
  }

  const isPayoffPossible = month < maxMonths;

  return {
    timeline,
    totalMonths: month,
    totalInterestPaid,
    totalPaid,
    payoffOrder,
    isPayoffPossible,
  };
}

/**
 * Calculate required extra payment to pay off in N months using binary search
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
    const payoff = calculatePayoff(creditCards, strategy, mid);
    
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
 * Get summary statistics for credit cards
 */
export function getCreditSummary(creditCards: CreditCard[]) {
  return {
    totalBalance: creditCards.reduce((sum, c) => sum + c.balance, 0),
    totalMinimumPayments: creditCards.reduce((sum, c) => sum + c.minimumPayment, 0),
    averageApr: creditCards.length > 0 
      ? creditCards.reduce((sum, c) => sum + c.apr, 0) / creditCards.length 
      : 0,
    cardCount: creditCards.length,
  };
}
