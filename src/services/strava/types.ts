
// Common types used throughout Strava API integration

// Token-related types
export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiryTimestamp: number;
}

// Strava API response types
export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile: string;
  // Add other athlete properties as needed
}

export interface StravaActivity {
  id: number;
  type: string;
  name: string;
  start_date: string;
  elapsed_time: number;
  distance: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  max_watts?: number;
  calories?: number;
  // Add other activity properties as needed
}

export interface FormattedActivity {
  id: string;
  date: string;
  activity_type: string;
  duration: number;
  distance: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_power: number | null;
  max_power: number | null;
  calories: number | null;
}
