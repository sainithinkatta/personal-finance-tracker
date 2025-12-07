
export interface BankAccount {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  currency: string;
  account_type?: string;
  credit_limit?: number;
  available_balance?: number;
  due_balance?: number;
  payment_due_date?: number;
  apr?: number;
  minimum_payment?: number;
  created_at: string;
  updated_at: string;
}

export interface BankAccountFormData {
  name: string;
  balance: number;
  currency: string;
  account_type: string;
  credit_limit?: number;
  available_balance?: number;
  due_balance?: number;
  payment_due_date?: number;
  apr?: number;
  minimum_payment?: number;
}
