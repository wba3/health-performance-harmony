
import { supabase } from "@/integrations/supabase/client";

// Define the SupabaseQueryResult type
export interface SupabaseQueryResult<T> {
  data: T | null;
  error: any;
}

// Define the TrainingData and WorkoutData types
export interface TrainingData {
  id: string;
  date: string;
  activity_type: string;
  duration: number | null;
  distance: number | null;
  calories: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_power: number | null;
  max_power: number | null;
  created_at: string;
  updated_at: string;
  source?: string;
}

export interface WorkoutData {
  date: string;
  activity_type: string;
  duration?: number | null;
  distance?: number | null;
  calories?: number | null;
  avg_heart_rate?: number | null;
  max_heart_rate?: number | null;
  avg_power?: number | null;
  max_power?: number | null;
  source?: string;
}
