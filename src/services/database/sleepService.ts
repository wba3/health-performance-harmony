
import { supabase } from "@/integrations/supabase/client";

// Sleep Data
export interface SleepData {
  id?: string;
  date: string;
  sleep_score: number;
  total_sleep: number;
  deep_sleep: number;
  rem_sleep: number;
  light_sleep: number;
  resting_hr: number | null;
  hrv: number | null;
  respiratory_rate: number | null;
}

export const getSleepData = async (limit: number = 7): Promise<SleepData[]> => {
  try {
    const { data, error } = await supabase
      .from('sleep_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

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

export const getLatestSleepData = async (): Promise<SleepData | null> => {
  try {
    const data = await getSleepData(1);
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getLatestSleepData:', error);
    return null;
  }
};

export const insertSleepData = async (sleepData: SleepData): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('sleep_data')
      .insert([sleepData])
      .select();

    if (error) {
      console.error('Error inserting sleep data:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error in insertSleepData:', error);
    return null;
  }
};

export const updateSleepData = async (id: string, updates: Partial<SleepData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sleep_data')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating sleep data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSleepData:', error);
    return false;
  }
};

export const deleteSleepData = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sleep_data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sleep data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSleepData:', error);
    return false;
  }
};
