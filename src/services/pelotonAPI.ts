
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { TrainingData, insertTrainingData } from "@/services/database/trainingService";

// Type definitions for Peloton credentials
interface PelotonCredentials {
  id: number;
  session_id: string;
  user_id: string;
  username?: string;
  created_at?: string;
}

/**
 * Check if Peloton is connected by looking for valid credentials
 */
export const isPelotonConnected = async (): Promise<boolean> => {
  try {
    // For now, use localStorage instead of the database
    const credentials = localStorage.getItem('peloton_credentials');
    return !!credentials;
    
    // Once database is working, use this instead:
    /*
    const { data, error } = await supabase
      .from('peloton_credentials')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error checking Peloton connection:', error);
      return false;
    }
    
    return !!data && data.length > 0;
    */
  } catch (error) {
    console.error('Error in isPelotonConnected:', error);
    return false;
  }
};

/**
 * Save Peloton credentials to storage
 */
export const savePelotonCredentials = async (
  sessionId: string, 
  userId: string,
  username?: string
): Promise<boolean> => {
  try {
    // For now, use localStorage instead of the database
    const credentials = {
      id: 1,
      session_id: sessionId,
      user_id: userId,
      username: username || '',
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('peloton_credentials', JSON.stringify(credentials));
    return true;
    
    // Once database is working, use this instead:
    /*
    const { data, error } = await supabase
      .from('peloton_credentials')
      .upsert({ 
        id: 1, // Using 1 as the ID for single-user mode
        session_id: sessionId,
        user_id: userId,
        username: username
      })
      .select();
    
    if (error) {
      console.error('Error saving Peloton credentials:', error);
      return false;
    }
    
    return !!data;
    */
  } catch (error) {
    console.error('Error in savePelotonCredentials:', error);
    return false;
  }
};

/**
 * Get stored Peloton credentials
 */
export const getPelotonCredentials = async (): Promise<PelotonCredentials | null> => {
  try {
    // For now, use localStorage instead of the database
    const credentialsJson = localStorage.getItem('peloton_credentials');
    if (!credentialsJson) return null;
    
    return JSON.parse(credentialsJson) as PelotonCredentials;
    
    // Once database is working, use this instead:
    /*
    const { data, error } = await supabase
      .from('peloton_credentials')
      .select('*')
      .eq('id', 1) // Using 1 as the ID for single-user mode
      .single();
    
    if (error) {
      console.error('Error getting Peloton credentials:', error);
      return null;
    }
    
    return data as PelotonCredentials;
    */
  } catch (error) {
    console.error('Error in getPelotonCredentials:', error);
    return null;
  }
};

/**
 * Clear Peloton credentials
 */
export const clearPelotonCredentials = async (): Promise<boolean> => {
  try {
    // For now, use localStorage instead of the database
    localStorage.removeItem('peloton_credentials');
    return true;
    
    // Once database is working, use this instead:
    /*
    const { error } = await supabase
      .from('peloton_credentials')
      .delete()
      .eq('id', 1); // Using 1 as the ID for single-user mode
    
    if (error) {
      console.error('Error clearing Peloton credentials:', error);
      return false;
    }
    
    return true;
    */
  } catch (error) {
    console.error('Error in clearPelotonCredentials:', error);
    return false;
  }
};

/**
 * Login to Peloton
 */
export const loginToPeloton = async (username: string, password: string): Promise<boolean> => {
  try {
    // Make API call to Peloton login endpoint
    const response = await fetch('https://api.onepeloton.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username_or_email: username,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to login to Peloton');
    }

    const data = await response.json();
    
    // Save credentials
    await savePelotonCredentials(
      data.session_id,
      data.user_id,
      data.username
    );
    
    return true;
  } catch (error) {
    console.error('Error logging in to Peloton:', error);
    toast({
      title: "Peloton Login Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Get recent Peloton workouts
 */
export const getRecentWorkouts = async (limit: number = 10): Promise<any[]> => {
  try {
    const credentials = await getPelotonCredentials();
    if (!credentials) {
      throw new Error('Not connected to Peloton');
    }

    // Make API call to get workouts
    const response = await fetch(
      `https://api.onepeloton.com/api/user/${credentials.user_id}/workouts?limit=${limit}`,
      {
        headers: {
          'Cookie': `peloton_session_id=${credentials.session_id}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Peloton workouts');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Peloton workouts:', error);
    return [];
  }
};

/**
 * Import Peloton workouts to the database
 */
export const importPelotonWorkouts = async (days: number = 30): Promise<number> => {
  try {
    // Get recent workouts
    const workouts = await getRecentWorkouts(50); // Get more than we need to filter by date
    
    if (!workouts || workouts.length === 0) {
      return 0;
    }
    
    // Filter workouts by date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.created_at * 1000);
      return workoutDate >= cutoffDate;
    });
    
    // Transform and insert each workout
    let importCount = 0;
    
    for (const workout of recentWorkouts) {
      try {
        // Get workout details
        const details = await getWorkoutDetails(workout.id);
        if (!details) continue;
        
        // Format the workout data
        const workoutData = {
          date: new Date(workout.created_at * 1000).toISOString().split('T')[0],
          activity_type: details.ride ? details.ride.type : 'Peloton Workout',
          duration: Math.round(workout.end_time - workout.start_time),
          distance: details.summary && details.summary.distance ? details.summary.distance.value : null,
          calories: details.summary && details.summary.calories ? details.summary.calories.value : null,
          avg_heart_rate: details.summary && details.summary.avg_heart_rate ? details.summary.avg_heart_rate.value : null,
          max_heart_rate: details.summary && details.summary.max_heart_rate ? details.summary.max_heart_rate.value : null,
          avg_power: details.summary && details.summary.avg_power ? details.summary.avg_power.value : null,
          max_power: details.summary && details.summary.max_power ? details.summary.max_power.value : null,
          source: 'peloton'
        };
        
        // Insert the workout data
        const result = await insertTrainingData(workoutData);
        
        if (result.data) {
          importCount++;
        }
      } catch (err) {
        console.error('Error importing Peloton workout:', err);
      }
    }
    
    return importCount;
  } catch (error) {
    console.error('Error importing Peloton workouts:', error);
    return 0;
  }
};

/**
 * Get details for a specific workout
 */
const getWorkoutDetails = async (workoutId: string): Promise<any> => {
  try {
    const credentials = await getPelotonCredentials();
    if (!credentials) {
      throw new Error('Not connected to Peloton');
    }

    // Make API call to get workout details
    const response = await fetch(
      `https://api.onepeloton.com/api/workout/${workoutId}`,
      {
        headers: {
          'Cookie': `peloton_session_id=${credentials.session_id}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch workout details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching workout details:', error);
    return null;
  }
};
