
import { supabase } from "@/integrations/supabase/client";

export interface AIInsight {
  id: string;
  date: string;
  insight_type: string;
  content: string;
  created_at?: string;
  rating?: number;
  is_read?: boolean;
}

export interface AIInsightInput {
  date: string;
  insight_type: string;
  content: string;
  rating?: number;
  is_read?: boolean;
}

/**
 * Get AI insights for a specified number of days
 * 
 * @param days - The number of days of data to retrieve
 * @returns Array of AI insight objects
 */
export const getAIInsights = async (days: number = 30): Promise<AIInsight[]> => {
  try {
    // Calculate the date for "days" ago
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    // Query the database for AI insights
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

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

/**
 * Insert or update an AI insight in the database
 * 
 * @param insight - The AI insight to insert or update
 * @returns The inserted/updated AI insight or null if there was an error
 */
export const upsertAIInsight = async (insight: AIInsightInput): Promise<AIInsight | null> => {
  try {
    // Check if insight already exists for the same date and type
    const { data: existingData } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('date', insight.date)
      .eq('insight_type', insight.insight_type)
      .limit(1);

    if (existingData && existingData.length > 0) {
      // Update existing insight
      const { data, error } = await supabase
        .from('ai_insights')
        .update(insight)
        .eq('id', existingData[0].id)
        .select()
        .single();

      if (error) {
        console.error('Error updating AI insight:', error);
        return null;
      }

      return data;
    }

    // Insert new insight
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insight)
      .select()
      .single();

    if (error) {
      console.error('Error inserting AI insight:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertAIInsight:', error);
    return null;
  }
};
