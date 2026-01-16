import { BankAccount } from '@/types/bankAccount';

// Calculate total balances by currency for debit accounts
export const calculateDebitTotals = (accounts: BankAccount[]) => {
  const debitAccounts = accounts.filter(a => a.account_type === 'Debit');
  const usdAccounts = debitAccounts.filter(a => a.currency === 'USD');
  const inrAccounts = debitAccounts.filter(a => a.currency === 'INR');

  const usd = usdAccounts.reduce((sum, a) => sum + a.balance, 0);
  const inr = inrAccounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    usd,
    inr,
    usdCount: usdAccounts.length,
    inrCount: inrAccounts.length,
    count: debitAccounts.length
  };
};

// Calculate credit utilization
export const calculateCreditUtilization = (accounts: BankAccount[]) => {
  const creditAccounts = accounts.filter(a => a.account_type === 'Credit');
  const totalLimit = creditAccounts.reduce(
    (sum, a) => sum + (a.credit_limit || 0),
    0
  );
  const totalUsed = creditAccounts.reduce(
    (sum, a) => sum + (a.due_balance || 0),
    0
  );
  const percentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
  return { totalLimit, totalUsed, percentage };
};

// Calculate total due this month
export const calculateTotalDue = (accounts: BankAccount[]) => {
  const creditAccounts = accounts.filter(a => a.account_type === 'Credit');
  const totalDue = creditAccounts.reduce(
    (sum, a) => sum + (a.due_balance || 0),
    0
  );

  // Find nearest due date
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const upcomingDueDates = creditAccounts
    .filter(a => a.payment_due_date)
    .map(a => {
      const dueDate = new Date(currentYear, currentMonth, a.payment_due_date!);
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      return dueDate;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  return { totalDue, nextDueDate: upcomingDueDates[0] || null };
};

// Get utilization color classes
export const getUtilizationColor = (percentage: number) => {
  if (percentage < 30) return {
    text: 'text-green-600',
    bg: 'bg-green-500',
    progress: 'bg-green-500'
  };
  if (percentage < 70) return {
    text: 'text-amber-600',
    bg: 'bg-amber-500',
    progress: 'bg-amber-500'
  };
  return {
    text: 'text-red-600',
    bg: 'bg-red-500',
    progress: 'bg-red-500'
  };
};

// Format balance with optional masking
export const formatBalance = (
  amount: number,
  currency: string,
  isHidden: boolean
) => {
  if (isHidden) return '••••••';
  const symbol = currency === 'USD' ? '$' : '₹';
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Get currency flag emoji
export const getCurrencyFlag = (currency: string) => {
  return currency === 'USD' ? '🇺🇸' : '🇮🇳';
};
