export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_type: string | null
          available_balance: number | null
          balance: number
          created_at: string
          credit_limit: number | null
          currency: string
          due_balance: number | null
          id: string
          name: string
          payment_due_date: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: string | null
          available_balance?: number | null
          balance?: number
          created_at?: string
          credit_limit?: number | null
          currency?: string
          due_balance?: number | null
          id?: string
          name: string
          payment_due_date?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string | null
          available_balance?: number | null
          balance?: number
          created_at?: string
          credit_limit?: number | null
          currency?: string
          due_balance?: number | null
          id?: string
          name?: string
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
          groceries_allocated: number | null
          groceries_spent: number | null
          id: string
          month: number
          name: string
          notes: string | null
          others_allocated: number | null
          others_spent: number | null
          start_date: string | null
          total_amount: number
          travel_allocated: number | null
          travel_spent: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          bills_allocated?: number | null
          bills_spent?: number | null
          created_at?: string
          currency?: string
          end_date?: string | null
          groceries_allocated?: number | null
          groceries_spent?: number | null
          id?: string
          month: number
          name: string
          notes?: string | null
          others_allocated?: number | null
          others_spent?: number | null
          start_date?: string | null
          total_amount: number
          travel_allocated?: number | null
          travel_spent?: number | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          bills_allocated?: number | null
          bills_spent?: number | null
          created_at?: string
          currency?: string
          end_date?: string | null
          groceries_allocated?: number | null
          groceries_spent?: number | null
          id?: string
          month?: number
          name?: string
          notes?: string | null
          others_allocated?: number | null
          others_spent?: number | null
          start_date?: string | null
          total_amount?: number
          travel_allocated?: number | null
          travel_spent?: number | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          bank_account_id: string | null
          budget_id: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          currency: string
          date: string
          description: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          budget_id?: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          budget_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string | null
          payment_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id?: string | null
          payment_date: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string | null
          payment_date?: string
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
          current_balance: number
          id: string
          monthly_payment: number
          name: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          current_balance: number
          id?: string
          monthly_payment: number
          name: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          monthly_payment?: number
          name?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          currency: string
          email_reminder: boolean | null
          frequency: string
          id: string
          name: string
          next_due_date: string
          reminder_days_before: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          email_reminder?: boolean | null
          frequency: string
          id?: string
          name: string
          next_due_date: string
          reminder_days_before?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          email_reminder?: boolean | null
          frequency?: string
          id?: string
          name?: string
          next_due_date?: string
          reminder_days_before?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          current_amount?: number | null
          id?: string
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          current_amount?: number | null
          id?: string
          name?: string
          target_amount?: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
