
export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  savings_goal_id: string;
  amount: number;
  contribution_date: string;
  description?: string;
  created_at: string;
}

export interface SavingsGoalFormData {
  name: string;
  target_amount: number;
  target_date: string;
  currency: string;
}
