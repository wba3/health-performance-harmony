import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

// Define the AIInsightInput type
interface AIInsightInput {
  date: string;
  insight_type: string;
  content: string;
  is_read: boolean | null;
  rating: number | null;
}

// Define the AIInsight type
interface AIInsight {
  id: string;
  created_at: string;
  date: string;
  insight_type: string;
  content: string;
  is_read: boolean | null;
  rating: number | null;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const dailyPrompt = `
Analyze the following health data and provide a concise insight. Focus on key trends and potential areas for improvement. Keep the insight short and actionable.

Data:
`;

const generateDailyInsight = async (healthData: string): Promise<string | null> => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: dailyPrompt + healthData }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating daily insight:', error);
    return null;
  }
};

// Fix the saveInsight function to remove created_at which is not in AIInsightInput
const saveInsight = async (insightData: AIInsightInput): Promise<AIInsight | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert({
        date: insightData.date,
        insight_type: insightData.insight_type,
        content: insightData.content,
        is_read: false,
        rating: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving insight:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveInsight:', error);
    return null;
  }
};

const getInsights = async (days: number = 7): Promise<AIInsight[]> => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching insights:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInsights:', error);
    return [];
  }
};

const markInsightAsRead = async (insightId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);

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

const rateInsight = async (insightId: string, rating: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_insights')
      .update({ rating: rating })
      .eq('id', insightId);

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

const generateInsightsFromData = async () => {
  try {
    // Fetch training data for the last 7 days
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const fromDate = date.toISOString().split('T')[0];

    const { data: trainingData, error: trainingError } = await supabase
      .from('training_data')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (trainingError) {
      console.error('Error fetching training data:', trainingError);
      return;
    }

    // Fetch sleep data for the last 7 days
    const { data: sleepData, error: sleepError } = await supabase
      .from('sleep_data')
      .select('*')
      .gte('date', fromDate)
      .order('date', { ascending: false });

    if (sleepError) {
      console.error('Error fetching sleep data:', sleepError);
      return;
    }

    // Combine and format the data
    const combinedData = `Training Data:\n${JSON.stringify(trainingData)}\n\nSleep Data:\n${JSON.stringify(sleepData)}`;

    // Generate insight using OpenAI
    const response = await generateDailyInsight(combinedData);

    if (!response) {
      console.error('Failed to generate insight from OpenAI.');
      return;
    }

    // When inserting insights, make sure it matches AIInsightInput type
    const { data, error } = await supabase
      .from('ai_insights')
      .insert({
        date: new Date().toISOString().split('T')[0],
        insight_type: 'daily',
        content: response,
        is_read: false,
        rating: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving generated insight:', error);
    } else {
      console.log('Generated insight saved successfully:', data);
    }

  } catch (error) {
    console.error('Error in generateInsightsFromData:', error);
  }
};

export { generateDailyInsight, saveInsight, getInsights, markInsightAsRead, rateInsight, generateInsightsFromData };
