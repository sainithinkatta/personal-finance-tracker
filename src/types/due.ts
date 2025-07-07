
export interface Due {
  id: string;
  user_id: string;
  type: 'I Owe' | 'They Owe Me';
  person_name: string;
  amount: number;
  currency: 'USD' | 'INR';
  due_date?: string;
  notes?: string;
  status: 'Pending' | 'Settled';
  settled_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDueData {
  type: 'I Owe' | 'They Owe Me';
  person_name: string;
  amount: number;
  currency: 'USD' | 'INR';
  due_date?: string;
  notes?: string;
  status?: 'Pending' | 'Settled';
}

export interface UpdateDueData {
  type?: 'I Owe' | 'They Owe Me';
  person_name?: string;
  amount?: number;
  currency?: 'USD' | 'INR';
  due_date?: string;
  notes?: string;
  status?: 'Pending' | 'Settled';
  settled_date?: string;
}
