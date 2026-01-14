export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_type: string | null
          apr: number | null
          available_balance: number | null
          balance: number | null
          created_at: string
          credit_limit: number | null
          currency: string | null
          due_balance: number | null
          id: string
          minimum_payment: number | null
          name: string | null
          payment_due_date: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: string | null
          apr?: number | null
          available_balance?: number | null
          balance?: number | null
          created_at?: string
          credit_limit?: number | null
          currency?: string | null
          due_balance?: number | null
          id?: string
          minimum_payment?: number | null
          name?: string | null
          payment_due_date?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string | null
          apr?: number | null
          available_balance?: number | null
          balance?: number | null
          created_at?: string
          credit_limit?: number | null
          currency?: string | null
          due_balance?: number | null
          id?: string
          minimum_payment?: number | null
          name?: string | null
          payment_due_date?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          bills_allocated: number | null
          bills_spent: number | null
          created_at: string
          currency: string
          end_date: string | null
          food_allocated: number | null
          food_spent: number | null
          groceries_allocated: number | null
          groceries_spent: number | null
          id: string
          month: number | null
          name: string | null
          notes: string | null
          others_allocated: number | null
          others_spent: number | null
          start_date: string | null
          total_amount: number | null
          travel_allocated: number | null
          travel_spent: number | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          bills_allocated?: number | null
          bills_spent?: number | null
          created_at?: string
          currency?: string
          end_date?: string | null
          food_allocated?: number | null
          food_spent?: number | null
          groceries_allocated?: number | null
          groceries_spent?: number | null
          id?: string
          month?: number | null
          name?: string | null
          notes?: string | null
          others_allocated?: number | null
          others_spent?: number | null
          start_date?: string | null
          total_amount?: number | null
          travel_allocated?: number | null
          travel_spent?: number | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          bills_allocated?: number | null
          bills_spent?: number | null
          created_at?: string
          currency?: string
          end_date?: string | null
          food_allocated?: number | null
          food_spent?: number | null
          groceries_allocated?: number | null
          groceries_spent?: number | null
          id?: string
          month?: number | null
          name?: string | null
          notes?: string | null
          others_allocated?: number | null
          others_spent?: number | null
          start_date?: string | null
          total_amount?: number | null
          travel_allocated?: number | null
          travel_spent?: number | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          created_at: string
          debt_id: string
          id: string
          interest_paid: number | null
          notes: string | null
          payment_amount: number | null
          payment_date: string
          principal_paid: number | null
        }
        Insert: {
          created_at?: string
          debt_id: string
          id?: string
          interest_paid?: number | null
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string
          principal_paid?: number | null
        }
        Update: {
          created_at?: string
          debt_id?: string
          id?: string
          interest_paid?: number | null
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string
          principal_paid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          created_at: string
          currency: string
          current_balance: number | null
          debt_name: string | null
          debt_type: string
          id: string
          interest_rate: number
          minimum_payment: number | null
          notes: string | null
          payment_due_day: number | null
          payoff_strategy: string | null
          principal_amount: number | null
          start_date: string
          status: string
          target_payoff_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_balance?: number | null
          debt_name?: string | null
          debt_type?: string
          id?: string
          interest_rate?: number
          minimum_payment?: number | null
          notes?: string | null
          payment_due_day?: number | null
          payoff_strategy?: string | null
          principal_amount?: number | null
          start_date?: string
          status?: string
          target_payoff_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_balance?: number | null
          debt_name?: string | null
          debt_type?: string
          id?: string
          interest_rate?: number
          minimum_payment?: number | null
          notes?: string | null
          payment_due_day?: number | null
          payoff_strategy?: string | null
          principal_amount?: number | null
          start_date?: string
          status?: string
          target_payoff_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dues: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          notes: string | null
          person_name: string | null
          settled_date: string | null
          status: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          person_name?: string | null
          settled_date?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          person_name?: string | null
          settled_date?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          bank_account_id: string | null
          budget_id: string | null
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string
          currency: string
          date: string
          description: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          bank_account_id?: string | null
          budget_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          bank_account_id?: string | null
          budget_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      import_history: {
        Row: {
          bank_account_id: string
          duplicate_count: number
          file_name: string
          file_size: number
          id: string
          imported_at: string
          imported_count: number
          skipped_count: number
          user_id: string
        }
        Insert: {
          bank_account_id: string
          duplicate_count?: number
          file_name: string
          file_size: number
          id?: string
          imported_at?: string
          imported_count?: number
          skipped_count?: number
          user_id: string
        }
        Update: {
          bank_account_id?: string
          duplicate_count?: number
          file_name?: string
          file_size?: number
          id?: string
          imported_at?: string
          imported_count?: number
          skipped_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_history_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          amount: number | null
          bank_account_id: string
          created_at: string
          currency: string | null
          date: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          bank_account_id: string
          created_at?: string
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          bank_account_id?: string
          created_at?: string
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          id: string
          loan_id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contribution_date: string
          created_at?: string
          id?: string
          loan_id: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          id?: string
          loan_id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_contributions_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string
          payment_month: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          loan_id: string
          payment_month: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          payment_month?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string
          currency: string
          id: string
          name: string
          notes: string | null
          principal: number
          reference_date: string
          reference_outstanding: number
          roi: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          name: string
          notes?: string | null
          principal: number
          reference_date: string
          reference_outstanding: number
          roi?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          name?: string
          notes?: string | null
          principal?: number
          reference_date?: string
          reference_outstanding?: number
          roi?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_occurrences: {
        Row: {
          amount: number
          bank_account_id: string | null
          created_at: string
          id: string
          notes: string | null
          occurrence_date: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          occurrence_date: string
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          occurrence_date?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_occurrences_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_occurrences_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          amount: number | null
          bank_account_id: string | null
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string
          currency: string
          email_reminder: boolean | null
          frequency: string | null
          id: string
          last_done_date: string | null
          last_reminder_sent_at: string | null
          name: string | null
          next_due_date: string
          plan_status: string
          reminder_days_before: number | null
          status: string | null
          updated_at: string
          user_id: string | null
          user_timezone: string | null
        }
        Insert: {
          amount?: number | null
          bank_account_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          currency?: string
          email_reminder?: boolean | null
          frequency?: string | null
          id?: string
          last_done_date?: string | null
          last_reminder_sent_at?: string | null
          name?: string | null
          next_due_date: string
          plan_status?: string
          reminder_days_before?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          user_timezone?: string | null
        }
        Update: {
          amount?: number | null
          bank_account_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          currency?: string
          email_reminder?: boolean | null
          frequency?: string | null
          id?: string
          last_done_date?: string | null
          last_reminder_sent_at?: string | null
          name?: string | null
          next_due_date?: string
          plan_status?: string
          reminder_days_before?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          user_timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          description: string | null
          id: string
          savings_goal_id: string | null
        }
        Insert: {
          amount: number
          contribution_date?: string
          created_at?: string
          description?: string | null
          id?: string
          savings_goal_id?: string | null
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          description?: string | null
          id?: string
          savings_goal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_contributions_savings_goal_id_fkey"
            columns: ["savings_goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          currency: string
          current_amount: number | null
          id: string
          name: string | null
          target_amount: number | null
          target_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          current_amount?: number | null
          id?: string
          name?: string | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          current_amount?: number | null
          id?: string
          name?: string | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expense_category: "Groceries" | "Food" | "Travel" | "Bills" | "Others"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      expense_category: ["Groceries", "Food", "Travel", "Bills", "Others"],
    },
  },
} as const
