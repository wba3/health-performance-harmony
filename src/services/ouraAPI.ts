
import { supabase } from "@/integrations/supabase/client";
import { SleepInsertData, insertSleepData } from "@/services/database/sleepService";
import { toast } from "@/components/ui/use-toast";

// Type definitions for Oura credentials
interface OuraCredentials {
  id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  created_at?: string;
}

/**
 * Check if Oura is connected by looking for valid credentials
 */
export const isOuraConnected = async (): Promise<boolean> => {
  try {
    // For now, use localStorage instead of the database
    const credentials = localStorage.getItem('oura_credentials');
    return !!credentials;
    
    // Once database is working, use this instead:
    /*
    const { data, error } = await supabase
      .from('oura_credentials')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error checking Oura connection:', error);
      return false;
    }
    
    return !!data && data.length > 0;
    */
  } catch (error) {
    console.error('Error in isOuraConnected:', error);
    return false;
  }
};

/**
 * Save Oura credentials to storage
 */
export const saveOuraCredentials = async (
  accessToken: string, 
  refreshToken: string,
  expiresAt: number
): Promise<boolean> => {
  try {
    // For now, use localStorage instead of the database
    const credentials = {
      id: 1,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('oura_credentials', JSON.stringify(credentials));
    return true;
    
    // Once database is working, use this instead:
    /*
    const { data, error } = await supabase
      .from('oura_credentials')
      .upsert({ 
        id: 1, // Using 1 as the ID for single-user mode
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt
      })
      .select();
    
    if (error) {
      console.error('Error saving Oura credentials:', error);
      return false;
    }
    
    return !!data;
    */
  } catch (error) {
    console.error('Error in saveOuraCredentials:', error);
    return false;
  }
};

/**
 * Get stored Oura credentials
 */
export const getOuraCredentials = async (): Promise<OuraCredentials | null> => {
  try {
    // For now, use localStorage instead of the database
    const credentialsJson = localStorage.getItem('oura_credentials');
    if (!credentialsJson) return null;
    
    return JSON.parse(credentialsJson) as OuraCredentials;
    
    // Once database is working, use this instead:
    /*
    const { data, error } = await supabase
      .from('oura_credentials')
      .select('*')
      .eq('id', 1) // Using 1 as the ID for single-user mode
      .single();
    
    if (error) {
      console.error('Error getting Oura credentials:', error);
      return null;
    }
    
    return data as OuraCredentials;
    */
  } catch (error) {
    console.error('Error in getOuraCredentials:', error);
    return null;
  }
};

/**
 * Clear Oura credentials
 */
export const clearOuraCredentials = async (): Promise<boolean> => {
  try {
    // For now, use localStorage instead of the database
    localStorage.removeItem('oura_credentials');
    return true;
    
    // Once database is working, use this instead:
    /*
    const { error } = await supabase
      .from('oura_credentials')
      .delete()
      .eq('id', 1); // Using 1 as the ID for single-user mode
    
    if (error) {
      console.error('Error clearing Oura credentials:', error);
      return false;
    }
    
    return true;
    */
  } catch (error) {
    console.error('Error in clearOuraCredentials:', error);
    return false;
  }
};

/**
 * Authenticate with Oura
 */
export const authenticateWithOura = async (authCode: string): Promise<boolean> => {
  try {
    // Client ID and redirect URI should be stored as environment variables
    const clientId = process.env.REACT_APP_OURA_CLIENT_ID || '';
    const clientSecret = process.env.REACT_APP_OURA_CLIENT_SECRET || '';
    const redirectUri = window.location.origin + '/settings';
    
    // Exchange auth code for tokens
    const response = await fetch('https://api.ouraring.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Failed to authenticate with Oura');
    }

    const data = await response.json();
    
    // Calculate expiration timestamp
    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
    
    // Save tokens
    await saveOuraCredentials(
      data.access_token,
      data.refresh_token,
      expiresAt
    );
    
    return true;
  } catch (error) {
    console.error('Error authenticating with Oura:', error);
    toast({
      title: "Oura Authentication Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Refresh Oura access token
 */
export const refreshOuraToken = async (): Promise<string | null> => {
  try {
    const credentials = await getOuraCredentials();
    if (!credentials) {
      throw new Error('No Oura credentials found');
    }
    
    // Check if token needs refresh
    const now = Math.floor(Date.now() / 1000);
    if (credentials.expires_at > now + 60) {
      // Token is still valid
      return credentials.access_token;
    }
    
    // Client ID and secret should be stored as environment variables
    const clientId = process.env.REACT_APP_OURA_CLIENT_ID || '';
    const clientSecret = process.env.REACT_APP_OURA_CLIENT_SECRET || '';
    
    // Refresh the token
    const response = await fetch('https://api.ouraring.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Oura token');
    }

    const data = await response.json();
    
    // Calculate new expiration timestamp
    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
    
    // Save new tokens
    await saveOuraCredentials(
      data.access_token,
      data.refresh_token,
      expiresAt
    );
    
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Oura token:', error);
    return null;
  }
};

/**
 * Get sleep data from Oura API
 */
export const getSleepDataFromOura = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    // Get valid access token
    const accessToken = await refreshOuraToken();
    if (!accessToken) {
      throw new Error('Failed to get valid Oura access token');
    }
    
    // Fetch sleep data
    const response = await fetch(
      `https://api.ouraring.com/v2/usercollection/sleep?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch sleep data from Oura');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching sleep data from Oura:', error);
    return [];
  }
};

/**
 * Import sleep data from Oura API to database
 */
export const importSleepDataFromOura = async (days: number = 30): Promise<number> => {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Get sleep data from Oura
    const sleepData = await getSleepDataFromOura(startDateStr, endDateStr);
    
    if (!sleepData || sleepData.length === 0) {
      return 0;
    }
    
    // Process and insert each sleep record
    let importCount = 0;
    
    for (const sleep of sleepData) {
      try {
        // Format the sleep data
        const sleepRecord: SleepInsertData = {
          date: sleep.day,
          sleep_score: sleep.sleep_score,
          total_sleep: sleep.total_sleep_duration ? Math.round(sleep.total_sleep_duration / 60) : null, // Convert to minutes
          deep_sleep: sleep.deep_sleep_duration ? Math.round(sleep.deep_sleep_duration / 60) : null,
          rem_sleep: sleep.rem_sleep_duration ? Math.round(sleep.rem_sleep_duration / 60) : null,
          light_sleep: sleep.light_sleep_duration ? Math.round(sleep.light_sleep_duration / 60) : null,
          resting_hr: sleep.average_heart_rate,
          hrv: sleep.average_hrv,
          respiratory_rate: sleep.average_breathing_rate,
        };
        
        // Insert the sleep data
        const result = await insertSleepData(sleepRecord);
        
        if (result) {
          importCount++;
        }
      } catch (err) {
        console.error('Error importing sleep data:', err);
      }
    }
    
    return importCount;
  } catch (error) {
    console.error('Error importing sleep data from Oura:', error);
    return 0;
  }
};
