
import { supabase } from "@/integrations/supabase/client";

// Sleep data services
export const getSleepData = async (dateFrom?: string, dateTo?: string) => {
  let query = supabase.from('sleep_data').select('*').order('date', { ascending: false });
  
  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('date', dateTo);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sleep data:', error);
    throw error;
  }
  
  return data;
};

export const getLatestSleepData = async () => {
  const { data, error } = await supabase
    .from('sleep_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching latest sleep data:', error);
    throw error;
  }
  
  return data;
};

export const insertSleepData = async (sleepData: Omit<SleepData, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('sleep_data')
    .insert(sleepData)
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting sleep data:', error);
    throw error;
  }
  
  return data;
};

// Training data services
export const getTrainingData = async (dateFrom?: string, dateTo?: string) => {
  let query = supabase.from('training_data').select('*').order('date', { ascending: false });
  
  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('date', dateTo);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching training data:', error);
    throw error;
  }
  
  return data;
};

export const getLatestTrainingData = async () => {
  const { data, error } = await supabase
    .from('training_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching latest training data:', error);
    throw error;
  }
  
  return data;
};

export const insertTrainingData = async (trainingData: Omit<TrainingData, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('training_data')
    .insert(trainingData)
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting training data:', error);
    throw error;
  }
  
  return data;
};

// AI Insights services
export const getAIInsights = async (limit = 3) => {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching AI insights:', error);
    throw error;
  }
  
  return data;
};

export const insertAIInsight = async (insight: Omit<AIInsight, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('ai_insights')
    .insert(insight)
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting AI insight:', error);
    throw error;
  }
  
  return data;
};

// Type definitions for our data models
export interface SleepData {
  id: string;
  date: string;
  sleep_score: number;
  total_sleep: number; // in minutes
  deep_sleep: number; // in minutes
  rem_sleep: number; // in minutes
  light_sleep: number; // in minutes
  resting_hr: number;
  hrv: number;
  respiratory_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingData {
  id: string;
  date: string;
  activity_type: string;
  duration: number; // in minutes
  distance: number; // in kilometers
  calories: number;
  avg_power: number; // in watts
  max_power: number; // in watts
  avg_heart_rate: number;
  max_heart_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  date: string;
  insight_type: string;
  content: string;
  is_read: boolean;
  rating: number | null;
  created_at: string;
}

export interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string | null;
  is_completed: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
}
