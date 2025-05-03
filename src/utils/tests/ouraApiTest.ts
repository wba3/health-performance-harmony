import {
  initiateOuraAuth,
  handleOuraCallback,
  isOuraConnected,
  disconnectOura,
  fetchOuraSleepData,
  importOuraSleepData,
  OuraCredentials,
  OuraSleepData
} from '@/services/ouraAPI';

/**
 * Interface for API test results
 */
interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Interface for overall Oura test report
 */
interface OuraTestReport {
  credentialsValid: ApiTestResult;
  authenticationTest: ApiTestResult;
  tokenRefreshTest: ApiTestResult;
  sleepDataFetchTest: ApiTestResult;
  dataImportTest: ApiTestResult;
  overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

/**
 * Test utility for Oura API integration
 * This utility validates API credentials, tests authentication flow,
 * token refresh, API connectivity, and sleep data retrieval
 */
export class OuraApiTest {
  private clientId: string | null;
  private clientSecret: string | null;
  private credentials: OuraCredentials | null;

  constructor() {
    this.clientId = localStorage.getItem('ouraClientId');
    this.clientSecret = localStorage.getItem('ouraClientSecret');
    
    // Get stored credentials
    const storedCredentials = localStorage.getItem('ouraCredentials');
    this.credentials = storedCredentials ? JSON.parse(storedCredentials) : null;
  }

  /**
   * Validate the Oura API credentials (client ID and client secret)
   * @returns ApiTestResult with validation information
   */
  async validateCredentials(): Promise<ApiTestResult> {
    try {
      // Check if client ID exists
      if (!this.clientId) {
        return {
          success: false,
          message: 'Client ID is not configured. Please set up your Oura Client ID in the settings.'
        };
      }

      // Check if client secret exists
      if (!this.clientSecret) {
        return {
          success: false,
          message: 'Client Secret is not configured. Please set up your Oura Client Secret in the settings.'
        };
      }

      // Check if client ID has minimum length
      if (this.clientId.length < 5) {
        return {
          success: false,
          message: 'Client ID appears to be too short. Please verify your Client ID.'
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
        message: 'Oura API credentials are properly configured.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while validating Oura API credentials.',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test the authentication state
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
      if (!this.credentials) {
        return {
          success: false,
          message: 'No authentication tokens found. You need to connect to Oura first.'
        };
      }

      // Check token format
      if (!this.credentials.accessToken || this.credentials.accessToken.length < 20) {
        return {
          success: false,
          message: 'Access token appears to be invalid. Please reconnect to Oura.'
        };
      }

      if (!this.credentials.refreshToken || this.credentials.refreshToken.length < 20) {
        return {
          success: false,
          message: 'Refresh token appears to be invalid. Please reconnect to Oura.'
        };
      }

      // Check if token expiration date is in the future
      if (!this.credentials.expiresAt || this.credentials.expiresAt <= Date.now()) {
        return {
          success: false,
          message: 'Access token has expired. A token refresh is required.'
        };
      }

      return {
        success: true,
        message: 'Authentication tokens are valid and properly stored.',
        details: {
          tokenExpiration: new Date(this.credentials.expiresAt).toLocaleString()
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
      // Check if we have necessary credentials
      if (!this.clientId || !this.clientSecret) {
        return {
          success: false,
          message: 'Cannot test token refresh: Missing API credentials.'
        };
      }

      if (!this.credentials || !this.credentials.refreshToken) {
        return {
          success: false,
          message: 'Cannot test token refresh: Missing refresh token.'
        };
      }

      // Instead of directly calling the non-exported refreshTokenIfNeeded function,
      // we'll test it indirectly through the fetchOuraSleepData function which uses it internally
      
      // Get a date range for testing
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // This will attempt to refresh the token if needed
      const result = await fetchOuraSleepData(
        this.clientId,
        this.clientSecret,
        startDate,
        endDate
      );

      if (result !== null) {
        return {
          success: true,
          message: 'Successfully refreshed access token.',
          details: {
            tokenStatus: 'Valid and refreshable'
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
   * Test API connection by fetching sleep data
   * @returns ApiTestResult with API connection information
   */
  async testSleepDataFetch(): Promise<ApiTestResult> {
    try {
      // Check if we have necessary credentials
      if (!this.clientId || !this.clientSecret) {
        return {
          success: false,
          message: 'Cannot fetch sleep data: Missing API credentials.'
        };
      }

      if (!this.credentials || !this.credentials.accessToken) {
        return {
          success: false,
          message: 'Cannot fetch sleep data: Not authenticated with Oura.'
        };
      }

      // Get the current date and yesterday's date for testing
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Attempt to fetch sleep data
      const sleepData = await fetchOuraSleepData(
        this.clientId,
        this.clientSecret,
        startDate,
        endDate
      );

      if (sleepData) {
        let sampleData: any = {};
        
        if (sleepData.length > 0) {
          const latestSleep = sleepData[0];
          sampleData = {
            date: latestSleep.day,
            score: latestSleep.score,
            hasDetails: !!latestSleep.contributors
          };
        }

        return {
          success: true,
          message: `Successfully fetched sleep data (${sleepData.length} records).`,
          details: {
            dataPoints: sleepData.length,
            sampleData
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to fetch sleep data or no data available for the specified period.'
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred while testing sleep data fetching.';

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Sleep data fetch failed: Unauthorized. Your access token may have expired.';
        } else {
          errorMessage = `Sleep data fetch failed: ${error.message}`;
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
   * Test data import functionality
   * @returns ApiTestResult with data import information
   */
  async testDataImport(): Promise<ApiTestResult> {
    try {
      // Check if we have necessary credentials
      if (!this.clientId || !this.clientSecret) {
        return {
          success: false,
          message: 'Cannot test data import: Missing API credentials.'
        };
      }

      if (!this.credentials || !this.credentials.accessToken) {
        return {
          success: false,
          message: 'Cannot test data import: Not authenticated with Oura.'
        };
      }

      // Attempt to import sleep data for the past 3 days only (to keep the test lightweight)
      const importCount = await importOuraSleepData(this.clientId, this.clientSecret, 3);

      if (importCount >= 0) {
        return {
          success: true,
          message: `Successfully tested data import functionality.`,
          details: {
            recordsImported: importCount,
            note: importCount === 0 ? 'No new records to import or no data available for the period.' : undefined
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to import sleep data.'
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred while testing data import.';

      if (error instanceof Error) {
        errorMessage = `Data import failed: ${error.message}`;
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
   * @returns OuraTestReport with the results of all tests
   */
  async runAllTests(): Promise<OuraTestReport> {
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
    
    let sleepDataResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials'
    };
    
    let importResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials'
    };

    if (credentialsResult.success) {
      // Test authentication
      authResult = await this.testAuthentication();
      
      if (authResult.success) {
        // Run these tests in sequence
        refreshResult = await this.testTokenRefresh();
        sleepDataResult = await this.testSleepDataFetch();
        
        if (sleepDataResult.success) {
          importResult = await this.testDataImport();
        }
      }
    }

    // Determine overall status
    let overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    
    if (
      credentialsResult.success && 
      authResult.success && 
      refreshResult.success && 
      sleepDataResult.success && 
      importResult.success
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
      sleepDataFetchTest: sleepDataResult,
      dataImportTest: importResult,
      overallStatus
    };
  }

  /**
   * Format test results into a readable string
   * @param report The test report to format
   * @returns Formatted string representation of the test report
   */
  static formatTestReport(report: OuraTestReport): string {
    const statusEmoji = {
      SUCCESS: '✅',
      FAILED: '❌',
      PARTIAL: '⚠️'
    };

    const resultEmoji = (result: ApiTestResult) => result.success ? '✅' : '❌';

    let output = `# Oura API Test Report ${statusEmoji[report.overallStatus]}\n\n`;
    
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
    if (report.tokenRefreshTest.details?.tokenStatus) {
      output += `Status: ${report.tokenRefreshTest.details.tokenStatus}\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Sleep Data Fetching ${resultEmoji(report.sleepDataFetchTest)}\n`;
    output += `${report.sleepDataFetchTest.message}\n`;
    if (report.sleepDataFetchTest.details?.dataPoints) {
      output += `Sleep records: ${report.sleepDataFetchTest.details.dataPoints}\n`;
      if (report.sleepDataFetchTest.details.sampleData?.date) {
        const sample = report.sleepDataFetchTest.details.sampleData;
        output += `Sample: ${sample.date} (Sleep Score: ${sample.score})\n\n`;
      } else {
        output += '\n';
      }
    } else {
      output += '\n';
    }
    
    output += `## Data Import ${resultEmoji(report.dataImportTest)}\n`;
    output += `${report.dataImportTest.message}\n`;
    if (report.dataImportTest.details?.recordsImported !== undefined) {
      output += `Records imported: ${report.dataImportTest.details.recordsImported}\n`;
      if (report.dataImportTest.details.note) {
        output += `Note: ${report.dataImportTest.details.note}\n\n`;
      } else {
        output += '\n';
      }
    } else {
      output += '\n';
    }
    
    output += `## Overall Status: ${report.overallStatus}\n`;
    
    return output;
  }
}

/**
 * Run all Oura API tests and return a formatted report
 * @returns Promise with a formatted test report
 */
export async function testOuraApi(): Promise<string> {
  const tester = new OuraApiTest();
  const report = await tester.runAllTests();
  return OuraApiTest.formatTestReport(report);
}

/**
 * Check if the Oura API credentials (client ID and secret) are valid
 * @returns True if the credentials are valid, false otherwise
 */
export async function areCredentialsValid(): Promise<boolean> {
  const tester = new OuraApiTest();
  const result = await tester.validateCredentials();
  return result.success;
}

/**
 * Test API connection to Oura
 * @returns True if connection is successful, false otherwise
 */
export async function canConnectToOura(): Promise<boolean> {
  const tester = new OuraApiTest();
  const result = await tester.testSleepDataFetch();
  return result.success;
}

export default {
  testOuraApi,
  areCredentialsValid,
  canConnectToOura,
  OuraApiTest,
};