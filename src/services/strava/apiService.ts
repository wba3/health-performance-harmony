
import { toast } from '@/components/ui/use-toast';
import { refreshTokenIfNeeded } from './authService';
import { StravaAthlete, StravaActivity } from './types';

// Constants
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

/**
 * Helper for authorized API requests
 */
export const fetchWithAuth = async (
  url: string, 
  clientId: string, 
  clientSecret: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const refreshed = await refreshTokenIfNeeded(clientId, clientSecret);
  if (!refreshed) {
    throw new Error('Could not refresh Strava token');
  }
  
  const accessToken = localStorage.getItem('strava_access_token');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  
  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Fetch athlete profile
 */
export const fetchAthleteProfile = async (clientId: string, clientSecret: string): Promise<StravaAthlete> => {
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
      
      // Check for Google authentication-related errors
      if (errorText.toLowerCase().includes('google') || 
          errorText.toLowerCase().includes('authentication') || 
          errorText.toLowerCase().includes('accounts.google.com')) {
        throw new Error('Google authentication error. Please try again with the Google account linked to your Strava.');
      }
      
      throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava profile:', error);
    
    // Special handling for Google authentication errors
    if (error instanceof Error && 
        (error.message.includes('google') || 
         error.message.includes('accounts.google.com'))) {
      toast({
        title: "Google Authentication Issue",
        description: "There was a problem with Google authentication. Make sure you're using the same Google account that's linked to your Strava.",
        variant: "warning",
      });
    }
    
    throw error;
  }
};

/**
 * Test Strava API connection
 */
export const testStravaConnection = async (
  clientId: string, 
  clientSecret: string
): Promise<boolean> => {
  try {
    console.log('Testing Strava API connection...');
    
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

/**
 * Fetch activities from Strava
 */
export const fetchStravaActivities = async (
  clientId: string,
  clientSecret: string,
  daysBack: number = 30
): Promise<StravaActivity[]> => {
  try {
    // Get activities from last 'days' days
    const after = new Date();
    after.setDate(after.getDate() - daysBack);
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
    
    return activities;
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
};
