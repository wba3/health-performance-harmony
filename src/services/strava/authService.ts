
import { toast } from '@/components/ui/use-toast';
import { StravaTokens } from './types';

// Configuration constants
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

// Token storage keys
const STRAVA_ACCESS_TOKEN_KEY = 'strava_access_token';
const STRAVA_REFRESH_TOKEN_KEY = 'strava_refresh_token';
const STRAVA_TOKEN_EXPIRY_KEY = 'strava_token_expiry';

/**
 * Initialize OAuth flow with Strava
 */
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
    
    // Get the current origin and domain for Strava settings
    const REDIRECT_URI = `${window.location.origin}/settings`;
    const APP_DOMAIN = window.location.origin.replace(/^https?:\/\//, '').split('/')[0];
    const STRAVA_DOMAIN = APP_DOMAIN.replace(/-/g, '');
    
    console.log('Initiating Strava auth with client ID:', clientId);
    console.log('App domain (original):', APP_DOMAIN);
    console.log('Strava-compatible domain (no dashes):', STRAVA_DOMAIN);
    console.log('Full redirect URI (for redirect settings):', REDIRECT_URI);
    
    // Generate a random state for security
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    const state = Array.from(array, x => x.toString(16).padStart(8, '0')).join('');
    localStorage.setItem('strava_auth_state', state);
    
    // Build authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      approval_prompt: 'force', // Force approval screen every time
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

/**
 * Handle OAuth callback and token exchange
 */
export const handleStravaCallback = async (
  code: string, 
  state: string, 
  clientId: string, 
  clientSecret: string
): Promise<boolean> => {
  console.log('Handling Strava callback with code:', code.substring(0, 5) + '...');
  
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
    console.log('Full code length:', code.length);
    console.log('Using redirect URI:', `${window.location.origin}/settings`);
    
    // Exchange authorization code for tokens
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
    
    // Handle response
    const responseText = await tokenResponse.text();
    console.log('Token exchange raw response:', responseText);
    
    let responseData;
    try {
      // Try to parse the response as JSON
      responseData = JSON.parse(responseText);
      console.log('Response data parsed successfully');
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      
      toast({
        title: "Strava API Error",
        description: "Received invalid response from Strava. Please try again later.",
        variant: "destructive",
      });
      
      return false;
    }
    
    // Check for error field in the response
    if (responseData.error) {
      console.error('Strava API error:', responseData.error);
      
      // Handle specific error types
      if (responseData.error === 'invalid_grant') {
        toast({
          title: "Authorization Error",
          description: "Invalid authorization code or expired code. Please try connecting again.",
          variant: "destructive",
        });
      } else if (responseData.error === 'invalid_client') {
        toast({
          title: "Client Error",
          description: "Invalid Strava API Client ID or Secret. Please check your credentials.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Strava API Error",
          description: responseData.error_description || "An error occurred while connecting to Strava.",
          variant: "destructive",
        });
      }
      
      return false;
    }
    
    // Success case - we got valid tokens
    if (responseData.access_token && responseData.refresh_token && responseData.expires_at) {
      console.log('Token exchange successful, saving tokens');
      
      // Save tokens to localStorage
      saveTokens(responseData.access_token, responseData.refresh_token, responseData.expires_at);
      
      // Clear state after successful auth
      localStorage.removeItem('strava_auth_state');
      
      return true;
    } else {
      console.error('Unexpected response format - missing required token fields');
      console.log('Response data:', responseData);
      
      toast({
        title: "Connection Error",
        description: "Received incomplete data from Strava. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
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

/**
 * Save tokens to localStorage
 */
export const saveTokens = (accessToken: string, refreshToken: string, expiryTimestamp: number) => {
  localStorage.setItem(STRAVA_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(STRAVA_REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(STRAVA_TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
};

/**
 * Check if tokens need refresh
 */
export const needsTokenRefresh = (): boolean => {
  const expiryTimestamp = localStorage.getItem(STRAVA_TOKEN_EXPIRY_KEY);
  if (!expiryTimestamp) return true;
  
  // Add a buffer of 5 minutes (300 seconds)
  return (parseInt(expiryTimestamp) - 300) < Math.floor(Date.now() / 1000);
};

/**
 * Refresh tokens if needed
 */
export const refreshTokenIfNeeded = async (clientId: string, clientSecret: string): Promise<boolean> => {
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
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      
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

/**
 * Check if connected to Strava
 */
export const isStravaConnected = (): boolean => {
  return Boolean(
    localStorage.getItem(STRAVA_ACCESS_TOKEN_KEY) &&
    localStorage.getItem(STRAVA_REFRESH_TOKEN_KEY)
  );
};

/**
 * Disconnect from Strava
 */
export const disconnectStrava = () => {
  localStorage.removeItem(STRAVA_ACCESS_TOKEN_KEY);
  localStorage.removeItem(STRAVA_REFRESH_TOKEN_KEY);
  localStorage.removeItem(STRAVA_TOKEN_EXPIRY_KEY);
};

/**
 * Get stored tokens
 */
export const getStoredTokens = (): StravaTokens | null => {
  const accessToken = localStorage.getItem(STRAVA_ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(STRAVA_REFRESH_TOKEN_KEY);
  const expiryTimestamp = localStorage.getItem(STRAVA_TOKEN_EXPIRY_KEY);
  
  if (!accessToken || !refreshToken || !expiryTimestamp) {
    return null;
  }
  
  return {
    accessToken,
    refreshToken,
    expiryTimestamp: parseInt(expiryTimestamp)
  };
};
