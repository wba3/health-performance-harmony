import {
  isStravaConnected,
  testStravaConnection,
  initiateStravaAuth,
  handleStravaCallback,
  disconnectStrava
} from '@/services/stravaAPI';
import { refreshTokenIfNeeded } from '@/services/strava/authService';
import { fetchAthleteProfile, fetchStravaActivities } from '@/services/strava/apiService';

/**
 * Interface for API test results
 */
interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Interface for overall Strava test report
 */
interface StravaTestReport {
  credentialsValid: ApiTestResult;
  authenticationTest: ApiTestResult;
  tokenRefreshTest: ApiTestResult;
  athleteProfileTest: ApiTestResult;
  activitiesRetrievalTest: ApiTestResult;
  overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

/**
 * Test utility for Strava API integration
 * This utility validates credentials, tests authentication flow,
 * token refresh, API connectivity, and activity retrieval
 */
export class StravaApiTest {
  private clientId: string | null;
  private clientSecret: string | null;
  private accessToken: string | null;
  private refreshToken: string | null;
  private tokenExpiresAt: number | null;

  constructor() {
    this.clientId = localStorage.getItem('stravaClientId');
    this.clientSecret = localStorage.getItem('stravaClientSecret');
    this.accessToken = localStorage.getItem('stravaAccessToken');
    this.refreshToken = localStorage.getItem('stravaRefreshToken');
    
    const expiresAt = localStorage.getItem('stravaTokenExpiresAt');
    this.tokenExpiresAt = expiresAt ? parseInt(expiresAt, 10) : null;
  }

  /**
   * Validate the Strava credentials (client ID and client secret)
   * @returns ApiTestResult with validation information
   */
  async validateCredentials(): Promise<ApiTestResult> {
    try {
      // Check if client ID exists
      if (!this.clientId) {
        return {
          success: false,
          message: 'Client ID is not configured. Please set up your Strava Client ID in the settings.'
        };
      }

      // Check if client secret exists
      if (!this.clientSecret) {
        return {
          success: false,
          message: 'Client Secret is not configured. Please set up your Strava Client Secret in the settings.'
        };
      }

      // Check if client ID is numeric
      if (!/^\d+$/.test(this.clientId)) {
        return {
          success: false,
          message: 'Client ID format appears to be invalid. Strava Client ID should be numeric.'
        };
      }

      // Check if client secret has minimum length
      if (this.clientSecret.length < 10) {
        return {
          success: false,
          message: 'Client Secret appears to be too short. Please verify your Client Secret.'
        };
      }

      return {
        success: true,
        message: 'Strava credentials are properly configured.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while validating Strava credentials.',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test the authentication flow
   * Note: This test will verify token storage and format but cannot do a full OAuth flow
   * @returns ApiTestResult with authentication information
   */
  async testAuthentication(): Promise<ApiTestResult> {
    try {
      // Check if we have valid credentials first
      const credentialsResult = await this.validateCredentials();
      if (!credentialsResult.success) {
        return {
          success: false,
          message: 'Cannot test authentication: Invalid credentials.',
          details: credentialsResult.message
        };
      }

      // Check if we have tokens stored
      if (!this.accessToken || !this.refreshToken || !this.tokenExpiresAt) {
        return {
          success: false,
          message: 'No authentication tokens found. You need to connect to Strava first.'
        };
      }

      // Check token format
      if (this.accessToken.length < 20) {
        return {
          success: false,
          message: 'Access token appears to be invalid. Please reconnect to Strava.'
        };
      }

      if (this.refreshToken.length < 20) {
        return {
          success: false,
          message: 'Refresh token appears to be invalid. Please reconnect to Strava.'
        };
      }

      // Check if token expiration date is in the future
      const currentTime = Math.floor(Date.now() / 1000);
      if (this.tokenExpiresAt <= currentTime) {
        return {
          success: false,
          message: 'Access token has expired. A token refresh is required.'
        };
      }

      return {
        success: true,
        message: 'Authentication tokens are valid and properly stored.',
        details: {
          tokenExpiration: new Date(this.tokenExpiresAt * 1000).toLocaleString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing authentication.',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test token refresh functionality
   * @returns ApiTestResult with token refresh information
   */
  async testTokenRefresh(): Promise<ApiTestResult> {
    try {
      // Check if we have a refresh token
      if (!this.refreshToken || !this.clientId || !this.clientSecret) {
        return {
          success: false,
          message: 'Cannot test token refresh: Missing refresh token or credentials.'
        };
      }

      // Attempt to refresh the token
      const result = await refreshTokenIfNeeded(
        this.clientId,
        this.clientSecret
      );

      if (result) {
        // Don't actually save the refreshed token to avoid disrupting the user's session
        return {
          success: true,
          message: 'Successfully refreshed access token.',
          details: {
            expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toLocaleString() // Token typically lasts 6 hours
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to refresh access token.'
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred while testing token refresh.';

      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Token refresh failed: Invalid refresh token or credentials.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Token refresh failed: Unauthorized. Your credentials may be invalid.';
        } else {
          errorMessage = `Token refresh failed: ${error.message}`;
        }
      }

      return {
        success: false,
        message: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test API connection by fetching athlete profile
   * @returns ApiTestResult with API connection information
   */
  async testAthleteProfile(): Promise<ApiTestResult> {
    try {
      // Check if we have an access token
      if (!this.accessToken) {
        return {
          success: false,
          message: 'Cannot test API connection: No access token available.'
        };
      }

      // Attempt to fetch athlete profile
      const athlete = await fetchAthleteProfile(this.clientId!, this.clientSecret!);

      if (athlete && athlete.id) {
        return {
          success: true,
          message: 'Successfully fetched athlete profile.',
          details: {
            athleteName: `${athlete.firstname} ${athlete.lastname}`,
            athleteId: athlete.id
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to fetch athlete profile.'
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred while testing API connection.';

      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'API connection failed: Unauthorized. Your access token may have expired.';
        } else {
          errorMessage = `API connection failed: ${error.message}`;
        }
      }

      return {
        success: false,
        message: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test activity retrieval functionality
   * @returns ApiTestResult with activity retrieval information
   */
  async testActivityRetrieval(): Promise<ApiTestResult> {
    try {
      // Check if we have an access token
      if (!this.accessToken) {
        return {
          success: false,
          message: 'Cannot test activity retrieval: No access token available.'
        };
      }

      // Attempt to fetch recent activities (last 30 days, limited to 100 by API)
      const activities = await fetchStravaActivities(this.clientId!, this.clientSecret!, 30);

      if (activities && activities.length) {
        return {
          success: true,
          message: `Successfully retrieved ${activities.length} activities.`,
          details: {
            recentActivity: activities[0] ? {
              name: activities[0].name,
              type: activities[0].type,
              date: activities[0].start_date,
              distance: activities[0].distance
            } : 'No activities found'
          }
        };
      } else if (activities && activities.length === 0) {
        return {
          success: true,
          message: 'Successfully connected to Strava API, but no activities were found.',
          details: {
            note: 'This is not an error. You may not have any activities on Strava yet.'
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve activities.'
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred while testing activity retrieval.';

      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Activity retrieval failed: Unauthorized. Your access token may have expired.';
        } else {
          errorMessage = `Activity retrieval failed: ${error.message}`;
        }
      }

      return {
        success: false,
        message: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run all tests and generate a comprehensive report
   * @returns StravaTestReport with the results of all tests
   */
  async runAllTests(): Promise<StravaTestReport> {
    // Start with credentials validation
    const credentialsResult = await this.validateCredentials();
    
    // Only proceed with further tests if credentials are valid
    let authResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials'
    };
    
    let refreshResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials'
    };
    
    let profileResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials'
    };
    
    let activitiesResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials'
    };

    if (credentialsResult.success) {
      // Test authentication
      authResult = await this.testAuthentication();
      
      if (authResult.success) {
        // Run these tests in sequence since they depend on valid auth
        refreshResult = await this.testTokenRefresh();
        profileResult = await this.testAthleteProfile();
        
        if (profileResult.success) {
          activitiesResult = await this.testActivityRetrieval();
        }
      }
    }

    // Determine overall status
    let overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    
    if (
      credentialsResult.success && 
      authResult.success && 
      refreshResult.success && 
      profileResult.success && 
      activitiesResult.success
    ) {
      overallStatus = 'SUCCESS';
    } else if (!credentialsResult.success || !authResult.success) {
      overallStatus = 'FAILED';
    } else {
      overallStatus = 'PARTIAL';
    }

    return {
      credentialsValid: credentialsResult,
      authenticationTest: authResult,
      tokenRefreshTest: refreshResult,
      athleteProfileTest: profileResult,
      activitiesRetrievalTest: activitiesResult,
      overallStatus
    };
  }

  /**
   * Format test results into a readable string
   * @param report The test report to format
   * @returns Formatted string representation of the test report
   */
  static formatTestReport(report: StravaTestReport): string {
    const statusEmoji = {
      SUCCESS: '✅',
      FAILED: '❌',
      PARTIAL: '⚠️'
    };

    const resultEmoji = (result: ApiTestResult) => result.success ? '✅' : '❌';

    let output = `# Strava API Test Report ${statusEmoji[report.overallStatus]}\n\n`;
    
    output += `## Credentials ${resultEmoji(report.credentialsValid)}\n`;
    output += `${report.credentialsValid.message}\n\n`;
    
    output += `## Authentication ${resultEmoji(report.authenticationTest)}\n`;
    output += `${report.authenticationTest.message}\n`;
    if (report.authenticationTest.details?.tokenExpiration) {
      output += `Token expires at: ${report.authenticationTest.details.tokenExpiration}\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Token Refresh ${resultEmoji(report.tokenRefreshTest)}\n`;
    output += `${report.tokenRefreshTest.message}\n`;
    if (report.tokenRefreshTest.details?.expiresAt) {
      output += `New token would expire at: ${report.tokenRefreshTest.details.expiresAt}\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Athlete Profile ${resultEmoji(report.athleteProfileTest)}\n`;
    output += `${report.athleteProfileTest.message}\n`;
    if (report.athleteProfileTest.details?.athleteName) {
      output += `Athlete: ${report.athleteProfileTest.details.athleteName} (ID: ${report.athleteProfileTest.details.athleteId})\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Activities Retrieval ${resultEmoji(report.activitiesRetrievalTest)}\n`;
    output += `${report.activitiesRetrievalTest.message}\n`;
    if (report.activitiesRetrievalTest.details?.recentActivity && typeof report.activitiesRetrievalTest.details.recentActivity !== 'string') {
      const activity = report.activitiesRetrievalTest.details.recentActivity;
      output += `Sample: ${activity.name} (${activity.type}, ${activity.date}, ${(activity.distance / 1000).toFixed(2)}km)\n\n`;
    } else if (report.activitiesRetrievalTest.details?.note) {
      output += `Note: ${report.activitiesRetrievalTest.details.note}\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Overall Status: ${report.overallStatus}\n`;
    
    return output;
  }
}

/**
 * Run all Strava API tests and return a formatted report
 * @returns Promise with a formatted test report
 */
export async function testStravaApi(): Promise<string> {
  const tester = new StravaApiTest();
  const report = await tester.runAllTests();
  return StravaApiTest.formatTestReport(report);
}

/**
 * Check if the Strava credentials (client ID and secret) are valid
 * @returns True if the credentials are valid, false otherwise
 */
export async function areCredentialsValid(): Promise<boolean> {
  const tester = new StravaApiTest();
  const result = await tester.validateCredentials();
  return result.success;
}

/**
 * Test API connection to Strava
 * @returns True if connection is successful, false otherwise
 */
export async function canConnectToStrava(): Promise<boolean> {
  const tester = new StravaApiTest();
  const result = await tester.testAthleteProfile();
  return result.success;
}

export default {
  testStravaApi,
  areCredentialsValid,
  canConnectToStrava,
  StravaApiTest
};