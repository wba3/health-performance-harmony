
import { supabase } from "@/integrations/supabase/client";

// Define the SupabaseQueryResult type since it's not exported from types.ts
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
  avg_power: number | null;  // Added to fix TS errors
  max_power: number | null;  // Added to fix TS errors
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

// Helper function to format workout data
export const formatWorkoutData = (data: Record<string, any>): WorkoutData => {
  // Ensure required fields
  if (!data.date || !data.activity_type) {
    throw new Error("Workout data must include date and activity_type");
  }

  return {
    date: data.date,
    activity_type: data.activity_type,
    duration: data.duration || null,
    distance: data.distance || null,
    calories: data.calories || null,
    avg_heart_rate: data.avg_heart_rate || null,
    max_heart_rate: data.max_heart_rate || null,
    avg_power: data.avg_power || null,
    max_power: data.max_power || null,
    source: data.source || 'manual'
  };
};

// Helper function to define training data properties
export const defineTrainingData = (data: WorkoutData): Omit<TrainingData, 'id' | 'created_at' | 'updated_at'> => {
  return {
    date: data.date,
    activity_type: data.activity_type,
    duration: data.duration || null,
    distance: data.distance || null,
    calories: data.calories || null,
    avg_heart_rate: data.avg_heart_rate || null,
    max_heart_rate: data.max_heart_rate || null,
    avg_power: data.avg_power || null,
    max_power: data.max_power || null,
    source: data.source || 'manual'
  };
};

/**
 * Insert training data into the database
 */
export const insertTrainingData = async (
  workoutData: WorkoutData
): Promise<SupabaseQueryResult<TrainingData>> => {
  try {
    // Validate and format workout data
    const formattedData = formatWorkoutData(workoutData);
    const trainingData = defineTrainingData(formattedData);

    // Insert the data into the database
    const { data, error } = await supabase
      .from('training_data')
      .insert(trainingData as any)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting training data:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in insertTrainingData:', error);
    return { data: null, error };
  }
};

/**
 * Get training data from the database
 */
export const getTrainingData = async (
  days: number = 30
): Promise<SupabaseQueryResult<TrainingData[]>> => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching training data:', error);
      return { data: null, error };
    }

    return { data: data as TrainingData[], error: null };
  } catch (error: any) {
    console.error('Error in getTrainingData:', error);
    return { data: null, error };
  }
};

/**
 * Update training data in the database
 */
export const updateTrainingData = async (
  id: string,
  workoutData: Partial<WorkoutData>
): Promise<SupabaseQueryResult<TrainingData>> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .update(workoutData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating training data:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in updateTrainingData:', error);
    return { data: null, error };
  }
};

/**
 * Delete training data from the database
 */
export const deleteTrainingData = async (
  id: string
): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from('training_data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting training data:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in deleteTrainingData:', error);
    return { success: false, error };
  }
};

/**
 * Get training data grouped by activity type
 */
export const getTrainingByActivity = async (
  days: number = 30
): Promise<SupabaseQueryResult<{
  activity_type: string;
  count: number;
  total_duration: number;
  total_distance: number;
  total_calories: number;
}[]>> => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching training data:', error);
      return { data: null, error };
    }

    // Group data by activity_type
    const groupedData = (data as TrainingData[]).reduce((acc, item) => {
      const existingGroup = acc.find(g => g.activity_type === item.activity_type);
      
      if (existingGroup) {
        existingGroup.count += 1;
        existingGroup.total_duration += item.duration || 0;
        existingGroup.total_distance += item.distance || 0;
        existingGroup.total_calories += item.calories || 0;
      } else {
        acc.push({
          activity_type: item.activity_type,
          count: 1,
          total_duration: item.duration || 0,
          total_distance: item.distance || 0,
          total_calories: item.calories || 0
        });
      }
      
      return acc;
    }, [] as {
      activity_type: string;
      count: number;
      total_duration: number;
      total_distance: number;
      total_calories: number;
    }[]);

    return { data: groupedData, error: null };
  } catch (error: any) {
    console.error('Error in getTrainingByActivity:', error);
    return { data: null, error };
  }
};
