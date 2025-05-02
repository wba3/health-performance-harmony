
import { supabase } from "@/integrations/supabase/client";
import { SupabaseQueryResult, TrainingData, WorkoutData } from './types';
import { formatWorkoutData, defineTrainingData } from './formatUtils';

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
