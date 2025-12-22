export interface Loan {
  id: string;
  user_id: string;
  name: string;
  principal: number;
  roi: number; // Annual percentage rate
  reference_outstanding: number;
  reference_date: string;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  user_id: string;
  payment_month: string; // First day of month YYYY-MM-DD
  amount: number;
  type: 'planned' | 'actual';
  created_at: string;
  updated_at: string;
}

// Loan contribution (actual payments made towards the loan)
export interface LoanContribution {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  contribution_date: string; // YYYY-MM-DD
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanContributionFormData {
  loan_id: string;
  amount: number;
  contribution_date: Date;
  note?: string;
}

export interface MonthlyProjection {
  month: string; // "Dec 2025"
  monthStart: Date;
  daysInMonth: number;
  openingBalance: number;
  interestAdded: number;
  closingBalance: number;
}

export interface LoanFormData {
  name: string;
  principal: number;
  roi: number;
  reference_outstanding: number;
  reference_date: Date;
  currency: string;
  notes?: string;
}
