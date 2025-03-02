
// Fixing the Type instantiation error in trainingService.ts
// This approach uses explicit typing to avoid excessive type recursion

import { supabase } from "@/integrations/supabase/client";
import { defineTrainingData, formatWorkoutData } from "@/utils/formatters";
import { WorkoutData } from "@/integrations/supabase/types";

// Define simplified types to prevent deep instantiation
type WorkoutExistenceCheck = { id: string };
type SupabaseQueryResult<T> = { data: T | null, error: any };

export interface TrainingData {
  id: string;
  date: string;
  source: string;
  activity_type: string;
  duration: number;
  distance?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  calories?: number;
  perceived_exertion?: number;
  external_id?: string;
  additional_metrics?: {
    [key: string]: any;
  };
}

/**
 * Saves a workout to the database
 * 
 * @param workoutData - The workout data to save
 * @returns The saved workout data or null if there was an error
 */
export const saveWorkout = async (workoutData: WorkoutData): Promise<TrainingData | null> => {
  try {
    // Check if workout already exists to prevent duplicates
    if (workoutData.external_id && await workoutExistsByExternalId(workoutData.external_id)) {
      console.log(`Workout with external_id ${workoutData.external_id} already exists.`);
      return null;
    }

    // Format workout data for Supabase
    const formattedData = formatWorkoutData(workoutData);

    // Insert the workout into the database
    const { data, error } = await supabase
      .from('training_data')
      .insert(formattedData)
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
 * Retrieves training data for the specified number of days
 * 
 * @param days - The number of days of data to retrieve
 * @returns Array of training data objects
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

    return data ? data.map(defineTrainingData) : [];
  } catch (error) {
    console.error('Error in getTrainingData:', error);
    return [];
  }
};

/**
 * Checks if a workout with the specified external ID already exists
 * 
 * @param externalId - The external ID to check
 * @returns True if the workout exists, false otherwise
 */
export const workoutExistsByExternalId = async (externalId: string): Promise<boolean> => {
  try {
    // Use explicit typing to avoid excessive type recursion
    const { data, error }: SupabaseQueryResult<WorkoutExistenceCheck[]> = await supabase
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
 * 
 * @param source - The source to get data from
 * @param limit - The maximum number of results to return
 * @returns Array of training data objects
 */
export const getTrainingDataBySource = async (source: string, limit: number = 10): Promise<TrainingData[]> => {
  try {
    // Use explicit typing to avoid excessive type recursion
    const { data, error }: SupabaseQueryResult<TrainingData[]> = await supabase
      .from('training_data')
      .select('*')
      .eq('source', source)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error fetching ${source} training data:`, error);
      return [];
    }

    return data ? data.map(defineTrainingData) : [];
  } catch (error) {
    console.error(`Error in getTrainingDataBySource (${source}):`, error);
    return [];
  }
};
