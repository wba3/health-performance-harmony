
import { supabase } from "@/integrations/supabase/client";

// Define the WorkoutData interface - correctly typed for inserts
export interface WorkoutData {
  external_id?: string;
  date: string;
  source: string;
  activity_type: string;
  duration: number;
  distance?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_power?: number;
  max_power?: number;
  calories?: number;
  perceived_exertion?: number;
  additional_metrics?: Record<string, any>;
}

// Define the TrainingData interface - correctly typed for database rows
export interface TrainingData {
  id: string;
  date: string;
  source: string;
  activity_type: string;
  duration: number;
  distance?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_power?: number;
  max_power?: number;
  calories?: number;
  perceived_exertion?: number;
  external_id?: string;
  additional_metrics?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Define simplified types for queries
type WorkoutExistenceCheck = { id: string };

// Define a simplified response type to avoid deep instantiation issues
interface SupabaseQueryResult<T> {
  data: T | null;
  error: any;
}

// Define the formatters directly in this file
const formatWorkoutData = (workoutData: WorkoutData): Record<string, any> => {
  return {
    ...workoutData,
    additional_metrics: workoutData.additional_metrics || {},
  };
};

const defineTrainingData = (data: any): TrainingData => {
  return {
    id: data.id,
    date: data.date,
    source: data.source || 'manual',
    activity_type: data.activity_type,
    duration: data.duration,
    distance: data.distance,
    avg_heart_rate: data.avg_heart_rate,
    max_heart_rate: data.max_heart_rate,
    avg_power: data.avg_power,
    max_power: data.max_power,
    calories: data.calories,
    perceived_exertion: data.perceived_exertion,
    external_id: data.external_id,
    additional_metrics: data.additional_metrics || {},
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Saves a workout to the database
 */
export const saveWorkout = async (workoutData: WorkoutData): Promise<TrainingData | null> => {
  try {
    // Check if workout already exists to prevent duplicates
    if (workoutData.external_id && await workoutExistsByExternalId(workoutData.external_id)) {
      console.log(`Workout with external_id ${workoutData.external_id} already exists.`);
      return null;
    }

    // Insert the workout into the database
    const { data, error } = await supabase
      .from('training_data')
      .insert(formatWorkoutData(workoutData))
      .select()
      .single();

    if (error) {
      console.error('Error saving workout:', error);
      return null;
    }

    return defineTrainingData(data);
  } catch (error) {
    console.error('Error in saveWorkout:', error);
    return null;
  }
};

/**
 * Insert training data (alias for saveWorkout for compatibility)
 */
export const insertTrainingData = saveWorkout;

/**
 * Retrieves training data for the specified number of days
 */
export const getTrainingData = async (days: number = 30): Promise<TrainingData[]> => {
  try {
    // Calculate the date for "days" ago
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    // Query the database for training data
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching training data:', error);
      return [];
    }

    // Use type assertion to avoid deep instantiation issues
    return (data || []).map(item => defineTrainingData(item));
  } catch (error) {
    console.error('Error in getTrainingData:', error);
    return [];
  }
};

/**
 * Checks if a workout with the specified external ID already exists
 */
export const workoutExistsByExternalId = async (externalId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .select('id')
      .eq('external_id', externalId)
      .limit(1);

    if (error) {
      console.error('Error checking workout existence:', error);
      return false;
    }

    return data !== null && data.length > 0;
  } catch (error) {
    console.error('Error in workoutExistsByExternalId:', error);
    return false;
  }
};

/**
 * Gets training data from a specific source
 */
export const getTrainingDataBySource = async (source: string, limit: number = 10): Promise<TrainingData[]> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .eq('source', source)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error fetching ${source} training data:`, error);
      return [];
    }

    // Use type assertion to avoid deep instantiation issues
    return (data || []).map(item => defineTrainingData(item));
  } catch (error) {
    console.error(`Error in getTrainingDataBySource (${source}):`, error);
    return [];
  }
};
