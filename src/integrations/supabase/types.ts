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
      ai_insights: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          insight_type: string
          is_read: boolean | null
          rating: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          insight_type: string
          is_read?: boolean | null
          rating?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          insight_type?: string
          is_read?: boolean | null
          rating?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          end_date: string | null
          goal_type: string
          id: string
          is_completed: boolean | null
          progress: number | null
          start_date: string
          target_unit: string
          target_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          goal_type: string
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          start_date: string
          target_unit: string
          target_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          start_date?: string
          target_unit?: string
          target_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      oura_credentials: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: number
          id: number
          refresh_token: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: number
          id: number
          refresh_token: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: number
          id?: number
          refresh_token?: string
        }
        Relationships: []
      }
      peloton_credentials: {
        Row: {
          created_at: string | null
          id: number
          session_id: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: number
          session_id: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          session_id?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      sleep_data: {
        Row: {
          created_at: string | null
          date: string
          deep_sleep: number | null
          hrv: number | null
          id: string
          light_sleep: number | null
          rem_sleep: number | null
          respiratory_rate: number | null
          resting_hr: number | null
          sleep_score: number | null
          total_sleep: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deep_sleep?: number | null
          hrv?: number | null
          id?: string
          light_sleep?: number | null
          rem_sleep?: number | null
          respiratory_rate?: number | null
          resting_hr?: number | null
          sleep_score?: number | null
          total_sleep?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deep_sleep?: number | null
          hrv?: number | null
          id?: string
          light_sleep?: number | null
          rem_sleep?: number | null
          respiratory_rate?: number | null
          resting_hr?: number | null
          sleep_score?: number | null
          total_sleep?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_data: {
        Row: {
          activity_type: string
          avg_heart_rate: number | null
          avg_power: number | null
          calories: number | null
          created_at: string | null
          date: string
          distance: number | null
          duration: number | null
          id: string
          max_heart_rate: number | null
          max_power: number | null
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          avg_heart_rate?: number | null
          avg_power?: number | null
          calories?: number | null
          created_at?: string | null
          date: string
          distance?: number | null
          duration?: number | null
          id?: string
          max_heart_rate?: number | null
          max_power?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          avg_heart_rate?: number | null
          avg_power?: number | null
          calories?: number | null
          created_at?: string | null
          date?: string
          distance?: number | null
          duration?: number | null
          id?: string
          max_heart_rate?: number | null
          max_power?: number | null
          updated_at?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
