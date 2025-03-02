import { supabase } from "@/integrations/supabase/client";
import { insertSleepData } from "./database";

// Oura API constants
const OURA_API_URL = "https://api.ouraring.com/v2";
const OURA_AUTH_URL = "https://cloud.ouraring.com/oauth/authorize";
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";

// Oura API response types
export interface OuraTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface OuraSleepData {
  id: string;
  day: string;
  contributors?: {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
  };
  score: number;
  timestamp: string;
}

export interface OuraSleepResponse {
  data: OuraSleepData[];
  next_token: string | null;
}

export interface OuraCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Store Oura credentials in localStorage for development
// In production, these should be stored securely in the database
const storeOuraCredentials = (credentials: OuraCredentials): void => {
  localStorage.setItem('ouraCredentials', JSON.stringify(credentials));
};

const getOuraCredentials = (): OuraCredentials | null => {
  const credentials = localStorage.getItem('ouraCredentials');
  return credentials ? JSON.parse(credentials) : null;
};

// Initialize OAuth flow
export const initiateOuraAuth = (clientId: string): void => {
  // Define redirect URL - in production this should be your actual app URL
  const redirectUri = `${window.location.origin}/settings`;
  
  // Define scopes needed for sleep data
  const scope = "daily sleep";
  
  // Generate a random state value for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('ouraAuthState', state);
  
  // Build authorization URL
  const authUrl = `${OURA_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&response_type=code`;
  
  // Redirect to Oura authorization page
  window.location.href = authUrl;
};

// Handle OAuth callback and exchange code for tokens
export const handleOuraCallback = async (
  code: string, 
  state: string,
  clientId: string,
  clientSecret: string
): Promise<boolean> => {
  // Verify state to prevent CSRF attacks
  const savedState = localStorage.getItem('ouraAuthState');
  if (state !== savedState) {
    throw new Error("State validation failed");
  }
  
  // Exchange authorization code for tokens
  const redirectUri = `${window.location.origin}/settings`;
  
  try {
    const response = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    const tokenData: OuraTokenResponse = await response.json();
    
    // Calculate token expiration time
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Store credentials
    storeOuraCredentials({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    });
    
    return true;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return false;
  }
};

// Refresh token if expired
const refreshTokenIfNeeded = async (
  clientId: string,
  clientSecret: string
): Promise<string | null> => {
  const credentials = getOuraCredentials();
  if (!credentials) {
    return null;
  }
  
  // If token is still valid, return it
  if (credentials.expiresAt > Date.now()) {
    return credentials.accessToken;
  }
  
  // Otherwise, refresh the token
  try {
    const response = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    const tokenData: OuraTokenResponse = await response.json();
    
    // Calculate new expiration time
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Store new credentials
    storeOuraCredentials({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    });
    
    return tokenData.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

// Get sleep data from Oura API
export const fetchOuraSleepData = async (
  clientId: string,
  clientSecret: string,
  startDate: string,
  endDate: string
): Promise<OuraSleepData[] | null> => {
  const accessToken = await refreshTokenIfNeeded(clientId, clientSecret);
  
  if (!accessToken) {
    console.error("No valid access token available");
    return null;
  }
  
  try {
    const url = `${OURA_API_URL}/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sleep data: ${response.statusText}`);
    }
    
    const data: OuraSleepResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    return null;
  }
};

// Import sleep data to the database
export const importOuraSleepData = async (
  clientId: string,
  clientSecret: string,
  days: number = 7
): Promise<number> => {
  // Calculate date range
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const sleepData = await fetchOuraSleepData(clientId, clientSecret, startDate, endDate);
    
    if (!sleepData || sleepData.length === 0) {
      return 0;
    }
    
    let importCount = 0;
    
    for (const day of sleepData) {
      if (!day.contributors) continue;
      
      const formattedData = {
        date: day.day,
        sleep_score: day.score,
        total_sleep: Math.round(day.contributors.total_sleep * 60), // Convert to minutes
        deep_sleep: Math.round((day.contributors.deep_sleep / 100) * day.contributors.total_sleep * 60),
        rem_sleep: Math.round((day.contributors.rem_sleep / 100) * day.contributors.total_sleep * 60),
        light_sleep: Math.round(
          (1 - (day.contributors.deep_sleep + day.contributors.rem_sleep) / 100) * 
          day.contributors.total_sleep * 60
        ),
        // These fields would need additional API calls to get heart rate data
        resting_hr: null,
        hrv: null,
        respiratory_rate: null
      };
      
      // Check if this date already exists in the database
      const { data: existingData } = await supabase
        .from('sleep_data')
        .select('id')
        .eq('date', day.day)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        await supabase
          .from('sleep_data')
          .update(formattedData)
          .eq('id', existingData.id);
      } else {
        // Insert new record
        await insertSleepData(formattedData);
      }
      
      importCount++;
    }
    
    return importCount;
  } catch (error) {
    console.error("Error importing sleep data:", error);
    return 0;
  }
};

// Check if user is connected to Oura
export const isOuraConnected = (): boolean => {
  return getOuraCredentials() !== null;
};

// Disconnect from Oura
export const disconnectOura = (): void => {
  localStorage.removeItem('ouraCredentials');
  localStorage.removeItem('ouraAuthState');
};
