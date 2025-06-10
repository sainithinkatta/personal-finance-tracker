
export interface Budget {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  month: number;
  year: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Category allocations
  travel_allocated?: number;
  groceries_allocated?: number;
  bills_allocated?: number;
  others_allocated?: number;
  // Category spending (tracked automatically)
  travel_spent?: number;
  groceries_spent?: number;
  bills_spent?: number;
  others_spent?: number;
}

export interface CategoryAllocations {
  travel_allocated: number;
  groceries_allocated: number;
  bills_allocated: number;
  others_allocated: number;
}

export interface BudgetAlert {
  type: 'warning' | 'danger';
  category: string;
  percentage: number;
  spent: number;
  budget: number;
}
