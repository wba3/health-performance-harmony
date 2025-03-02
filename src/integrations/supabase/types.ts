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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
