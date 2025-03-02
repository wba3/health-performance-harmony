
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { fetchStravaActivities } from './apiService';
import { FormattedActivity, StravaActivity } from './types';

/**
 * Format activity to match our training_data table structure
 */
export const formatActivity = (activity: StravaActivity): FormattedActivity => {
  return {
    id: activity.id.toString(),
    date: new Date(activity.start_date).toISOString().split('T')[0],
    activity_type: activity.type,
    duration: Math.round(activity.elapsed_time),
    distance: activity.distance / 1000, // Convert to kilometers
    avg_heart_rate: activity.average_heartrate || null,
    max_heart_rate: activity.max_heartrate || null,
    avg_power: activity.average_watts || null,
    max_power: activity.max_watts || null,
    calories: activity.calories || null,
  };
};

/**
 * Import activities into Supabase
 */
export const importStravaActivities = async (
  clientId: string, 
  clientSecret: string, 
  days: number = 30
): Promise<number> => {
  try {
    console.log(`Importing Strava activities from last ${days} days...`);
    
    // Fetch activities from Strava API
    const activities = await fetchStravaActivities(clientId, clientSecret, days);
    
    // Format activities for our database
    const formattedActivities = activities.map(formatActivity);
    
    // Store in Supabase
    let insertCount = 0;
    for (const activity of formattedActivities) {
      // Check if activity already exists
      const { data: existingActivity } = await supabase
        .from('training_data')
        .select('id')
        .eq('id', activity.id)
        .single();
      
      if (!existingActivity) {
        // Insert new activity
        const { error } = await supabase
          .from('training_data')
          .insert(activity);
        
        if (error) {
          console.error('Error inserting Strava activity:', error);
        } else {
          insertCount++;
        }
      }
    }
    
    console.log(`Imported ${insertCount} new Strava activities`);
    return insertCount;
  } catch (error) {
    console.error('Error importing Strava activities:', error);
    throw error;
  }
};
