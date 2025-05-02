
import { supabase } from "@/integrations/supabase/client";
import { SupabaseQueryResult, TrainingData } from './types';

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
