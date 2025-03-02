
import { supabase } from "@/integrations/supabase/client";
import { upsertAIInsight } from "./database";

// Check if OpenAI API key is available
export const isOpenAIConfigured = (): boolean => {
  const openaiApiKey = localStorage.getItem('openai_api_key');
  return Boolean(openaiApiKey);
};

// Store API key in localStorage (for development only)
// In production, this should be stored securely in Supabase
export const setOpenAIApiKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};

// Get OpenAI API key
export const getOpenAIApiKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
};

// Remove OpenAI API key
export const removeOpenAIApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

// Generate insights based on sleep and training data
export const generateInsights = async (
  model: string = 'gpt-4o',
  maxInsights: number = 3
): Promise<boolean> => {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    console.error('OpenAI API key not found');
    return false;
  }
  
  try {
    // Fetch recent sleep data
    const { data: sleepData, error: sleepError } = await supabase
      .from('sleep_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(7);
    
    if (sleepError) {
      console.error('Error fetching sleep data:', sleepError);
      return false;
    }
    
    // Fetch recent training data
    const { data: trainingData, error: trainingError } = await supabase
      .from('training_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(7);
    
    if (trainingError) {
      console.error('Error fetching training data:', trainingError);
      return false;
    }
    
    // Prepare the data for OpenAI
    const contextData = {
      sleep: sleepData || [],
      training: trainingData || []
    };
    
    // If we don't have enough data, use some placeholder data for demo
    if ((sleepData?.length || 0) < 3 && (trainingData?.length || 0) < 3) {
      return generateInsightsWithPlaceholderData(apiKey, model, maxInsights);
    }
    
    // Build the prompt
    const prompt = `
    As an AI coach specialized in health and performance optimization, analyze the following data and generate ${maxInsights} detailed insights or recommendations. 
    
    Sleep and training data from the last 7 days:
    ${JSON.stringify(contextData, null, 2)}
    
    For each insight:
    1. Identify patterns or correlations between sleep quality and training performance
    2. Provide specific, actionable recommendations
    3. Classify each insight as one of: "performance", "recommendation", or "alert"
    
    Format your response as a JSON array with each object containing:
    { "insight_type": "performance|recommendation|alert", "content": "The detailed insight text" }
    `;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI coach specializing in sleep and athletic performance optimization. You analyze patterns in sleep and training data to provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    const insightsContent = result.choices[0].message.content;
    
    // Parse the JSON response
    let insights;
    try {
      // Sometimes the API returns markdown wrapped JSON, so we need to extract it
      const jsonMatch = insightsContent.match(/```json\n([\s\S]*?)\n```/) || 
                      insightsContent.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        insights = JSON.parse(jsonMatch[1]);
      } else {
        insights = JSON.parse(insightsContent);
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response:', insightsContent);
      return false;
    }
    
    // Store insights in the database
    for (const insight of insights) {
      const date = new Date().toISOString();
      await upsertAIInsight({
        date,
        insight_type: insight.insight_type,
        content: insight.content,
        is_read: false,
        rating: null,
        created_at: date
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error generating insights:', error);
    return false;
  }
};

// Generate insights with placeholder data when real data is not available
const generateInsightsWithPlaceholderData = async (
  apiKey: string,
  model: string,
  maxInsights: number
): Promise<boolean> => {
  try {
    // Placeholder data for demo purposes
    const placeholderData = {
      sleep: [
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          sleep_score: 85,
          total_sleep: 460, // minutes
          deep_sleep: 120,
          rem_sleep: 90,
          light_sleep: 250,
          resting_hr: 58,
          hrv: 65
        },
        {
          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          sleep_score: 75,
          total_sleep: 420,
          deep_sleep: 100,
          rem_sleep: 80,
          light_sleep: 240,
          resting_hr: 62,
          hrv: 58
        },
        {
          date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
          sleep_score: 90,
          total_sleep: 480,
          deep_sleep: 130,
          rem_sleep: 110,
          light_sleep: 240,
          resting_hr: 56,
          hrv: 70
        }
      ],
      training: [
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          activity_type: "Run",
          duration: 3600, // seconds
          distance: 10.5, // km
          avg_heart_rate: 145,
          max_heart_rate: 175,
          avg_power: 210,
          calories: 850
        },
        {
          date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
          activity_type: "Ride",
          duration: 5400,
          distance: 30.2,
          avg_heart_rate: 135,
          max_heart_rate: 165,
          avg_power: 185,
          calories: 950
        }
      ]
    };
    
    // Build the prompt
    const prompt = `
    As an AI coach specialized in health and performance optimization, analyze the following data and generate ${maxInsights} detailed insights or recommendations. 
    
    This is placeholder data for demonstration purposes:
    ${JSON.stringify(placeholderData, null, 2)}
    
    For each insight:
    1. Identify patterns or correlations between sleep quality and training performance
    2. Provide specific, actionable recommendations
    3. Classify each insight as one of: "performance", "recommendation", or "alert"
    
    Format your response as a JSON array with each object containing:
    { "insight_type": "performance|recommendation|alert", "content": "The detailed insight text" }
    `;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI coach specializing in sleep and athletic performance optimization. You analyze patterns in sleep and training data to provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    const insightsContent = result.choices[0].message.content;
    
    // Parse the JSON response
    let insights;
    try {
      // Sometimes the API returns markdown wrapped JSON, so we need to extract it
      const jsonMatch = insightsContent.match(/```json\n([\s\S]*?)\n```/) || 
                      insightsContent.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        insights = JSON.parse(jsonMatch[1]);
      } else {
        insights = JSON.parse(insightsContent);
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response:', insightsContent);
      return false;
    }
    
    // Store insights in the database
    for (const insight of insights) {
      const date = new Date().toISOString();
      await upsertAIInsight({
        date,
        insight_type: insight.insight_type,
        content: insight.content,
        is_read: false,
        rating: null,
        created_at: date
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error generating insights with placeholder data:', error);
    return false;
  }
};

// Generate AI coach response
export const generateCoachResponse = async (
  userPrompt: string,
  model: string = 'gpt-4o'
): Promise<string | null> => {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    console.error('OpenAI API key not found');
    return null;
  }
  
  try {
    // Get recent context data if available
    const { data: sleepData } = await supabase
      .from('sleep_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(3);
    
    const { data: trainingData } = await supabase
      .from('training_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(3);
    
    // Prepare context for the coach
    let contextPrompt = "";
    if ((sleepData?.length || 0) > 0 || (trainingData?.length || 0) > 0) {
      contextPrompt = `
      Recent sleep data: ${JSON.stringify(sleepData || [])}
      
      Recent training data: ${JSON.stringify(trainingData || [])}
      `;
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are an AI coach specializing in sleep and athletic performance optimization. 
            You provide personalized, supportive coaching based on training and sleep data.
            Be conversational, motivational and specific. Keep responses concise but informative.
            Refer to any available data for personalization.`
          },
          {
            role: 'user',
            content: `${contextPrompt}
            
            User question: ${userPrompt}`
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
    
  } catch (error) {
    console.error('Error generating coach response:', error);
    return null;
  }
};
