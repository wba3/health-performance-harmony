
import { supabase } from "@/integrations/supabase/client";

export interface SleepData {
  id: string;
  date: string;
  sleep_score?: number;
  total_sleep?: number;
  deep_sleep?: number;
  rem_sleep?: number;
  light_sleep?: number;
  resting_hr?: number;
  hrv?: number;
  respiratory_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SleepInsertData {
  date: string;
  sleep_score?: number;
  total_sleep?: number;
  deep_sleep?: number;
  rem_sleep?: number;
  light_sleep?: number;
  resting_hr?: number;
  hrv?: number;
  respiratory_rate?: number;
}

/**
 * Get sleep data for a specified number of days
 * 
 * @param days - The number of days of data to retrieve
 * @returns Array of sleep data objects
 */
export const getSleepData = async (days: number = 30): Promise<SleepData[]> => {
  try {
    // Calculate the date for "days" ago
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    // Query the database for sleep data
    const { data, error } = await supabase
      .from('sleep_data')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sleep data:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSleepData:', error);
    return [];
  }
};

/**
 * Insert sleep data into the database
 * 
 * @param sleepData - The sleep data to insert
 * @returns The inserted sleep data or null if there was an error
 */
export const insertSleepData = async (sleepData: SleepInsertData): Promise<SleepData | null> => {
  try {
    // Check if sleep data already exists for the date
    const { data: existingData } = await supabase
      .from('sleep_data')
      .select('id')
      .eq('date', sleepData.date)
      .limit(1);

    if (existingData && existingData.length > 0) {
      console.log(`Sleep data for date ${sleepData.date} already exists.`);
      
      // Update existing data
      const { data, error } = await supabase
        .from('sleep_data')
        .update(sleepData)
        .eq('date', sleepData.date)
        .select()
        .single();

      if (error) {
        console.error('Error updating sleep data:', error);
        return null;
      }

      return data;
    }

    // Insert new sleep data
    const { data, error } = await supabase
      .from('sleep_data')
      .insert(sleepData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting sleep data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in insertSleepData:', error);
    return null;
  }
};
