
import { supabase } from "@/integrations/supabase/client";

// Training Data
export interface TrainingData {
  id?: string;
  date: string;
  activity_type: string;
  duration: number;
  distance: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_power: number | null;
  max_power: number | null;
  calories: number | null;
  source?: string;
  external_id?: string;
}

// Define a simpler type for checking workout existence
type WorkoutExistenceCheck = {
  id: string;
};

export const getTrainingData = async (limit: number = 7): Promise<TrainingData[]> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching training data:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTrainingData:', error);
    return [];
  }
};

export const insertTrainingData = async (trainingData: TrainingData): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .insert([trainingData])
      .select();

    if (error) {
      console.error('Error inserting training data:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error in insertTrainingData:', error);
    return null;
  }
};

export const updateTrainingData = async (id: string, updates: Partial<TrainingData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('training_data')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating training data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateTrainingData:', error);
    return false;
  }
};

export const deleteTrainingData = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('training_data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting training data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTrainingData:', error);
    return false;
  }
};

// Check if workout with external ID exists
export const workoutExistsByExternalId = async (externalId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .select('id')
      .eq('external_id', externalId)
      .limit(1) as { data: WorkoutExistenceCheck[] | null, error: any };

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

// Get training data by source
export const getTrainingDataBySource = async (source: string, limit: number = 7): Promise<TrainingData[]> => {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .eq('source', source)
      .order('date', { ascending: false })
      .limit(limit) as { data: TrainingData[] | null, error: any };

    if (error) {
      console.error(`Error fetching ${source} training data:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getTrainingDataBySource for ${source}:`, error);
    return [];
  }
};
