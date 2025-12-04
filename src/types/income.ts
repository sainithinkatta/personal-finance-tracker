export interface Income {
  id: string;
  user_id: string;
  bank_account_id: string;
  amount: number;
  currency: string;
  description?: string;
  created_at: string;
}

export interface IncomeFormData {
  bank_account_id: string;
  amount: number;
  currency: string;
  description?: string;
}
