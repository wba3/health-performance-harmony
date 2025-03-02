
/**
 * Unofficial Peloton API integration
 * Based on: https://github.com/ostranme/peloton-postman
 */

// Store auth tokens in localStorage
const PELOTON_SESSION_KEY = 'peloton_session';
const PELOTON_USER_ID_KEY = 'peloton_user_id';
const PELOTON_USERNAME_KEY = 'peloton_username';

// Base API URL
const PELOTON_API_URL = 'https://api.onepeloton.com';

/**
 * Check if user is connected to Peloton
 */
export const isPelotonConnected = (): boolean => {
  const session = localStorage.getItem(PELOTON_SESSION_KEY);
  const userId = localStorage.getItem(PELOTON_USER_ID_KEY);
  return !!session && !!userId;
};

/**
 * Connect to Peloton with username and password
 */
export const connectToPeloton = async (
  username: string, 
  password: string
): Promise<boolean> => {
  try {
    console.log('Connecting to Peloton...');
    
    const response = await fetch(`${PELOTON_API_URL}/auth/login`, {
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
      console.error('Peloton login error:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store session token and user ID
    localStorage.setItem(PELOTON_SESSION_KEY, data.session_id);
    localStorage.setItem(PELOTON_USER_ID_KEY, data.user_id);
    localStorage.setItem(PELOTON_USERNAME_KEY, username);
    
    console.log('Connected to Peloton successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to Peloton:', error);
    return false;
  }
};

/**
 * Disconnect from Peloton
 */
export const disconnectPeloton = (): void => {
  localStorage.removeItem(PELOTON_SESSION_KEY);
  localStorage.removeItem(PELOTON_USER_ID_KEY);
  localStorage.removeItem(PELOTON_USERNAME_KEY);
};

/**
 * Get Peloton auth headers
 */
const getPelotonHeaders = (): HeadersInit => {
  const session = localStorage.getItem(PELOTON_SESSION_KEY);
  
  return {
    'Content-Type': 'application/json',
    'Cookie': `peloton_session_id=${session}`,
  };
};

/**
 * Test Peloton connection
 */
export const testPelotonConnection = async (): Promise<boolean> => {
  if (!isPelotonConnected()) {
    return false;
  }
  
  try {
    const userId = localStorage.getItem(PELOTON_USER_ID_KEY);
    const response = await fetch(`${PELOTON_API_URL}/api/user/${userId}`, {
      headers: getPelotonHeaders(),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error testing Peloton connection:', error);
    return false;
  }
};

/**
 * Get user's Peloton workouts
 */
export const getPelotonWorkouts = async (
  limit: number = 10
): Promise<any[]> => {
  if (!isPelotonConnected()) {
    return [];
  }
  
  try {
    const userId = localStorage.getItem(PELOTON_USER_ID_KEY);
    const response = await fetch(
      `${PELOTON_API_URL}/api/user/${userId}/workouts?limit=${limit}&page=0`, 
      {
        headers: getPelotonHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch workouts');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Peloton workouts:', error);
    return [];
  }
};

/**
 * Get workout details by ID
 */
export const getWorkoutDetails = async (workoutId: string): Promise<any> => {
  if (!isPelotonConnected()) {
    return null;
  }
  
  try {
    const response = await fetch(
      `${PELOTON_API_URL}/api/workout/${workoutId}`,
      {
        headers: getPelotonHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch workout details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching workout details:', error);
    return null;
  }
};

/**
 * Import Peloton workouts into database
 */
export const importPelotonWorkouts = async (
  limit: number = 30
): Promise<number> => {
  if (!isPelotonConnected()) {
    throw new Error('Not connected to Peloton');
  }

  try {
    // Fetch workouts from Peloton API
    const workouts = await getPelotonWorkouts(limit);
    
    if (!workouts.length) {
      return 0;
    }
    
    // Import successful workouts
    let importCount = 0;
    
    for (const workout of workouts) {
      try {
        // Get detailed workout data
        const workoutDetails = await getWorkoutDetails(workout.id);
        
        if (!workoutDetails) {
          continue;
        }
        
        // Transform data for our database
        const trainingData = {
          date: new Date(workout.created_at * 1000).toISOString().split('T')[0],
          activity_type: workout.fitness_discipline,
          duration: Math.round(workout.ride.duration / 60), // Convert to minutes
          distance: workoutDetails.ride.distance ? parseFloat(workoutDetails.ride.distance.toFixed(2)) : 0,
          avg_heart_rate: workoutDetails.metrics?.heart_rate?.average_value || null,
          max_heart_rate: workoutDetails.metrics?.heart_rate?.max_value || null,
          avg_power: workoutDetails.metrics?.output?.average_value || null,
          max_power: workoutDetails.metrics?.output?.max_value || null,
          calories: workoutDetails.ride.calories || null,
          source: 'peloton',
          external_id: workout.id
        };
        
        // Import to database using our database service
        const { data, error } = await fetch('/api/import-peloton-workout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workout: trainingData }),
        }).then(res => res.json());
        
        if (error) {
          console.error('Error importing workout:', error);
          continue;
        }
        
        importCount++;
      } catch (err) {
        console.error('Error processing workout:', err);
        continue;
      }
    }
    
    return importCount;
  } catch (error) {
    console.error('Error importing Peloton workouts:', error);
    throw error;
  }
};

/**
 * Get user's Peloton profile info
 */
export const getPelotonProfile = async (): Promise<any> => {
  if (!isPelotonConnected()) {
    return null;
  }
  
  try {
    const userId = localStorage.getItem(PELOTON_USER_ID_KEY);
    const response = await fetch(
      `${PELOTON_API_URL}/api/user/${userId}`,
      {
        headers: getPelotonHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Peloton profile:', error);
    return null;
  }
};
