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
}

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

// AI Insights
export interface AIInsight {
  id: string;
  date: string;
  insight_type: string;
  content: string;
  is_read: boolean;
  rating: number | null;
  created_at: string;
}

// Get AI insights
export const getAIInsights = async (limit: number = 10): Promise<AIInsight[]> => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching AI insights:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAIInsights:', error);
    return [];
  }
};

// Insert or update AI insight
export const upsertAIInsight = async (insight: Omit<AIInsight, 'id'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert([insight])
      .select();
    
    if (error) {
      console.error('Error upserting AI insight:', error);
      return null;
    }
    
    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error in upsertAIInsight:', error);
    return null;
  }
};

// Mark insight as read
export const markInsightAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking insight as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markInsightAsRead:', error);
    return false;
  }
};

// Rate insight
export const rateInsight = async (id: string, rating: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_insights')
      .update({ rating })
      .eq('id', id);
    
    if (error) {
      console.error('Error rating insight:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in rateInsight:', error);
    return false;
  }
};
