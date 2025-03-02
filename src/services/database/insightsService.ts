
import { supabase } from "@/integrations/supabase/client";

// AI Insights
export interface AIInsight {
  id?: string;
  date: string;
  insight_type: string;
  content: string;
  is_read: boolean;
  rating: number | null;
  created_at?: string;
}

// Simpler type for creating insights to avoid recursive type issues
export type AIInsightInput = {
  date: string;
  insight_type: string;
  content: string;
  is_read: boolean;
  rating: number | null;
  created_at?: string;
};

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

export const insertAIInsight = async (insight: AIInsightInput): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert([insight])
      .select();
    
    if (error) {
      console.error('Error inserting AI insight:', error);
      return null;
    }
    
    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error in insertAIInsight:', error);
    return null;
  }
};

// Adding alias to insertAIInsight for backward compatibility
export const upsertAIInsight = insertAIInsight;

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
