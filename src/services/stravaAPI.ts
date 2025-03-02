import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  try {
    // Validate client ID
    if (!clientId || clientId.trim() === '') {
      toast({
        title: "Client ID Required",
        description: "Please enter a valid Strava API Client ID",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Initiating Strava auth with client ID:', clientId);
    
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
    
    const authUrl = `${STRAVA_AUTH_URL}?${params.toString()}`;
    console.log('Redirecting to Strava auth URL:', authUrl);
    
    // Redirect to Strava authorization page
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating Strava auth:', error);
    toast({
      title: "Authorization Error",
      description: "Failed to initiate Strava authorization",
      variant: "destructive",
    });
  }
};

// Handle OAuth callback and token exchange
export const handleStravaCallback = async (
  code: string, 
  state: string, 
  clientId: string, 
  clientSecret: string
): Promise<boolean> => {
  console.log('Handling Strava callback with code:', code);
  
  try {
    // Verify state matches for security
    const savedState = localStorage.getItem('strava_auth_state');
    if (state !== savedState) {
      console.error('State mismatch in Strava auth flow');
      console.log('Received state:', state);
      console.log('Saved state:', savedState);
      
      toast({
        title: "Security Error",
        description: "Authentication state mismatch. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
    
    // Validate client credentials
    if (!clientId || !clientSecret) {
      console.error('Missing Strava client credentials');
      
      toast({
        title: "Configuration Error",
        description: "Missing Strava API credentials. Please check your Client ID and Secret.",
        variant: "destructive",
      });
      
      return false;
    }
    
    console.log('Exchanging code for tokens with client ID:', clientId);
    
    // Exchange authorization code for tokens
    console.log('POST request to:', STRAVA_TOKEN_URL);
    const tokenResponse = await fetch(STRAVA_TOKEN_URL, {
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
    
    console.log('Token exchange response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Strava token exchange failed:', tokenResponse.statusText, errorText);
      
      // Show specific error message based on response
      if (tokenResponse.status === 400) {
        toast({
          title: "Authorization Failed",
          description: "Invalid authorization code or credentials. Please try connecting again.",
          variant: "destructive",
        });
      } else if (tokenResponse.status === 401) {
        toast({
          title: "Authorization Failed",
          description: "Invalid Strava API credentials. Please check your Client ID and Secret.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: `Strava API error: ${tokenResponse.status} ${tokenResponse.statusText}`,
          variant: "destructive",
        });
      }
      
      return false;
    }
    
    const data = await tokenResponse.json();
    console.log('Token exchange successful, received tokens');
    
    // Save tokens to localStorage
    saveTokens(data.access_token, data.refresh_token, data.expires_at);
    
    // Clear state after successful auth
    localStorage.removeItem('strava_auth_state');
    
    return true;
  } catch (error) {
    console.error('Error during Strava token exchange:', error);
    
    toast({
      title: "Connection Error",
      description: "An unexpected error occurred while connecting to Strava. Please try again.",
      variant: "destructive",
    });
    
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
    console.log('Refreshing Strava token...');
    
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
      const errorText = await response.text();
      console.error('Strava token refresh failed:', response.statusText, errorText);
      throw new Error(`Strava token refresh failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Token refresh successful');
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
    console.log('Fetching Strava athlete profile...');
    
    const response = await fetchWithAuth(
      `${STRAVA_API_BASE}/athlete`, 
      clientId, 
      clientSecret
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava API error:', response.statusText, errorText);
      throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
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

// Test Strava API connection
export const testStravaConnection = async (
  clientId: string, 
  clientSecret: string
): Promise<boolean> => {
  try {
    console.log('Testing Strava API connection...');
    
    // First check if we have valid tokens
    if (!isStravaConnected()) {
      console.error('Not connected to Strava');
      return false;
    }
    
    // Try to refresh token if needed
    const refreshed = await refreshTokenIfNeeded(clientId, clientSecret);
    if (!refreshed) {
      console.error('Failed to refresh Strava token');
      return false;
    }
    
    // Simple API call to test connection
    const response = await fetchWithAuth(
      `${STRAVA_API_BASE}/athlete`, 
      clientId, 
      clientSecret
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava connection test failed:', response.statusText, errorText);
      return false;
    }
    
    console.log('Strava connection test successful');
    return true;
  } catch (error) {
    console.error('Error testing Strava connection:', error);
    return false;
  }
};

// Import activities into Supabase
export const importStravaActivities = async (
  clientId: string, 
  clientSecret: string, 
  days: number = 30
): Promise<number> => {
  try {
    console.log(`Importing Strava activities from last ${days} days...`);
    
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
      const errorText = await response.text();
      console.error('Strava API error:', response.statusText, errorText);
      throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
    }
    
    const activities = await response.json();
    console.log(`Found ${activities.length} Strava activities`);
    
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
