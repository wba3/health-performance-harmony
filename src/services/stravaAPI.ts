
import { supabase } from '@/integrations/supabase/client';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const REDIRECT_URI = `${window.location.origin}/settings`;

// Token storage keys
const STRAVA_ACCESS_TOKEN_KEY = 'strava_access_token';
const STRAVA_REFRESH_TOKEN_KEY = 'strava_refresh_token';
const STRAVA_TOKEN_EXPIRY_KEY = 'strava_token_expiry';

// Initialize OAuth flow
export const initiateStravaAuth = (clientId: string) => {
  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('strava_auth_state', state);
  
  // Build authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all,profile:read_all',
    state: state
  });
  
  // Redirect to Strava authorization page
  window.location.href = `${STRAVA_AUTH_URL}?${params.toString()}`;
};

// Handle OAuth callback and token exchange
export const handleStravaCallback = async (
  code: string, 
  state: string, 
  clientId: string, 
  clientSecret: string
): Promise<boolean> => {
  // Verify state matches for security
  const savedState = localStorage.getItem('strava_auth_state');
  if (state !== savedState) {
    console.error('State mismatch in Strava auth flow');
    return false;
  }
  
  try {
    // Exchange authorization code for tokens
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Strava token exchange failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Save tokens to localStorage
    saveTokens(data.access_token, data.refresh_token, data.expires_at);
    
    // Clear state after successful auth
    localStorage.removeItem('strava_auth_state');
    
    return true;
  } catch (error) {
    console.error('Error during Strava token exchange:', error);
    return false;
  }
};

// Save tokens to localStorage
const saveTokens = (accessToken: string, refreshToken: string, expiryTimestamp: number) => {
  localStorage.setItem(STRAVA_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(STRAVA_REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(STRAVA_TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
};

// Check if tokens need refresh
const needsTokenRefresh = (): boolean => {
  const expiryTimestamp = localStorage.getItem(STRAVA_TOKEN_EXPIRY_KEY);
  if (!expiryTimestamp) return true;
  
  // Add a buffer of 5 minutes (300 seconds)
  return (parseInt(expiryTimestamp) - 300) < Math.floor(Date.now() / 1000);
};

// Refresh tokens if needed
const refreshTokenIfNeeded = async (clientId: string, clientSecret: string): Promise<boolean> => {
  if (!needsTokenRefresh()) {
    return true;
  }
  
  const refreshToken = localStorage.getItem(STRAVA_REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    console.error('No refresh token available for Strava');
    return false;
  }
  
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Strava token refresh failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    saveTokens(data.access_token, data.refresh_token, data.expires_at);
    
    return true;
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    return false;
  }
};

// Check if connected to Strava
export const isStravaConnected = (): boolean => {
  return Boolean(
    localStorage.getItem(STRAVA_ACCESS_TOKEN_KEY) &&
    localStorage.getItem(STRAVA_REFRESH_TOKEN_KEY)
  );
};

// Disconnect from Strava
export const disconnectStrava = () => {
  localStorage.removeItem(STRAVA_ACCESS_TOKEN_KEY);
  localStorage.removeItem(STRAVA_REFRESH_TOKEN_KEY);
  localStorage.removeItem(STRAVA_TOKEN_EXPIRY_KEY);
};

// Helper for authorized API requests
const fetchWithAuth = async (
  url: string, 
  clientId: string, 
  clientSecret: string, 
  options: RequestInit = {}
) => {
  const refreshed = await refreshTokenIfNeeded(clientId, clientSecret);
  if (!refreshed) {
    throw new Error('Could not refresh Strava token');
  }
  
  const accessToken = localStorage.getItem(STRAVA_ACCESS_TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Fetch athlete profile
export const fetchAthleteProfile = async (clientId: string, clientSecret: string) => {
  try {
    const response = await fetchWithAuth(
      `${STRAVA_API_BASE}/athlete`, 
      clientId, 
      clientSecret
    );
    
    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava profile:', error);
    throw error;
  }
};

// Format activity to match our training_data table structure
const formatActivity = (activity: any) => {
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

// Import activities into Supabase
export const importStravaActivities = async (
  clientId: string, 
  clientSecret: string, 
  days: number = 30
): Promise<number> => {
  try {
    // Get activities from last 'days' days
    const after = new Date();
    after.setDate(after.getDate() - days);
    const afterTimestamp = Math.floor(after.getTime() / 1000);
    
    const response = await fetchWithAuth(
      `${STRAVA_API_BASE}/athlete/activities?after=${afterTimestamp}&per_page=100`, 
      clientId, 
      clientSecret
    );
    
    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`);
    }
    
    const activities = await response.json();
    
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
    
    return insertCount;
  } catch (error) {
    console.error('Error importing Strava activities:', error);
    throw error;
  }
};
