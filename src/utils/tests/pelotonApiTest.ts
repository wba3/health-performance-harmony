import {
  connectToPeloton,
  isPelotonConnected,
  testPelotonConnection,
  getPelotonProfile,
  getPelotonWorkouts,
  getWorkoutDetails
} from '@/services/pelotonAPI';

/**
 * Interface for API test results
 */
interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Interface for overall Peloton test report
 */
interface PelotonTestReport {
  credentialsValid: ApiTestResult;
  authenticationTest: ApiTestResult;
  sessionManagementTest: ApiTestResult;
  profileFetchTest: ApiTestResult;
  workoutsRetrievalTest: ApiTestResult;
  workoutDetailsTest: ApiTestResult;
  overallStatus: 'success' | 'partial' | 'failed';
}

/**
 * Test utility for Peloton API integration
 * This utility validates credentials, tests authentication, session management,
 * and verifies the functionality of profile and workout data retrieval
 */
export class PelotonApiTest {
  private username: string | null;
  private password: string | null;
  private isConnected: boolean;

  constructor(username?: string, password?: string) {
    this.username = username || localStorage.getItem('peloton_username') || null;
    this.password = password || null;
    this.isConnected = isPelotonConnected();
  }

  /**
   * Validate the credentials format
   * @returns ApiTestResult with validation information
   */
  async validateCredentials(): Promise<ApiTestResult> {
    try {
      // Check if already connected - no need to validate credentials
      if (this.isConnected) {
        return {
          success: true,
          message: 'Already connected to Peloton. Credentials validation skipped.',
        };
      }

      // Check if credentials are provided
      if (!this.username || !this.password) {
        return {
          success: false,
          message: 'Credentials not provided. Please enter both username and password.',
        };
      }

      // Basic email format validation if username appears to be an email
      if (this.username.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.username)) {
          return {
            success: false,
            message: 'Email format appears to be invalid.',
          };
        }
      }

      // Password length check
      if (this.password.length < 8) {
        return {
          success: false,
          message: 'Password is too short. Peloton passwords should be at least 8 characters.',
        };
      }

      return {
        success: true,
        message: 'Credentials format is valid.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while validating credentials.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test authentication with the Peloton API
   * @returns ApiTestResult with authentication information
   */
  async testAuthentication(): Promise<ApiTestResult> {
    try {
      // If already connected, skip full authentication but verify connection
      if (this.isConnected) {
        const connectionTest = await testPelotonConnection();
        
        if (connectionTest) {
          return {
            success: true,
            message: 'Already authenticated with Peloton. Connection verified.',
          };
        } else {
          return {
            success: false,
            message: 'Previously authenticated, but connection test failed. You may need to re-authenticate.',
          };
        }
      }

      // If not connected, check if credentials are provided
      if (!this.username || !this.password) {
        return {
          success: false,
          message: 'Cannot test authentication: Credentials not provided.',
        };
      }

      // Try to connect with provided credentials
      const success = await connectToPeloton(this.username, this.password);

      if (success) {
        this.isConnected = true;
        return {
          success: true,
          message: 'Successfully authenticated with Peloton API.',
        };
      } else {
        return {
          success: false,
          message: 'Authentication failed. Please check your credentials.',
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred during authentication.';
      
      if (error instanceof Error) {
        errorMessage = `Authentication failed: ${error.message}`;
      }

      return {
        success: false,
        message: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test session management
   * @returns ApiTestResult with session management information
   */
  async testSessionManagement(): Promise<ApiTestResult> {
    try {
      if (!this.isConnected && (!this.username || !this.password)) {
        return {
          success: false,
          message: 'Cannot test session management: Not authenticated.',
        };
      }

      // If not connected yet, try to connect first
      if (!this.isConnected && this.username && this.password) {
        const success = await connectToPeloton(this.username, this.password);
        if (!success) {
          return {
            success: false,
            message: 'Session management test failed: Could not authenticate.',
          };
        }
        this.isConnected = true;
      }

      // Verify the session is working with a connection test
      const connected = await testPelotonConnection();
      
      if (connected) {
        return {
          success: true,
          message: 'Session is valid and working properly.',
        };
      } else {
        return {
          success: false,
          message: 'Session appears to be invalid or expired.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing session management.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test profile data retrieval
   * @returns ApiTestResult with profile retrieval information
   */
  async testProfileRetrieval(): Promise<ApiTestResult> {
    try {
      if (!this.isConnected && (!this.username || !this.password)) {
        return {
          success: false,
          message: 'Cannot test profile retrieval: Not authenticated.',
        };
      }

      // If not connected yet, try to connect first
      if (!this.isConnected && this.username && this.password) {
        const success = await connectToPeloton(this.username, this.password);
        if (!success) {
          return {
            success: false,
            message: 'Profile retrieval test failed: Could not authenticate.',
          };
        }
        this.isConnected = true;
      }

      // Fetch user profile
      const profile = await getPelotonProfile();
      
      if (profile) {
        return {
          success: true,
          message: 'Successfully retrieved user profile.',
          details: {
            username: profile.username,
            name: `${profile.first_name} ${profile.last_name}`,
            user_id: profile.id
          },
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve user profile.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing profile retrieval.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test workout data retrieval
   * @returns ApiTestResult with workouts retrieval information
   */
  async testWorkoutsRetrieval(): Promise<ApiTestResult> {
    try {
      if (!this.isConnected && (!this.username || !this.password)) {
        return {
          success: false,
          message: 'Cannot test workouts retrieval: Not authenticated.',
        };
      }

      // If not connected yet, try to connect first
      if (!this.isConnected && this.username && this.password) {
        const success = await connectToPeloton(this.username, this.password);
        if (!success) {
          return {
            success: false,
            message: 'Workouts retrieval test failed: Could not authenticate.',
          };
        }
        this.isConnected = true;
      }

      // Fetch workouts (limit to 5 for test purposes)
      const workouts = await getPelotonWorkouts(5);
      
      if (workouts && workouts.length > 0) {
        // Get the most recent workout for display
        const latestWorkout = workouts[0];
        const date = new Date(latestWorkout.created_at * 1000);
        
        return {
          success: true,
          message: `Successfully retrieved ${workouts.length} workouts.`,
          details: {
            count: workouts.length,
            recent_workout: `${latestWorkout.fitness_discipline} workout on ${date.toLocaleDateString()}`
          },
        };
      } else if (workouts && workouts.length === 0) {
        return {
          success: true,
          message: 'Successfully connected, but no workouts found for this account.',
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve workouts.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing workouts retrieval.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test workout details functionality
   * @returns ApiTestResult with workout details information
   */
  async testWorkoutDetails(): Promise<ApiTestResult> {
    try {
      if (!this.isConnected && (!this.username || !this.password)) {
        return {
          success: false,
          message: 'Cannot test workout details: Not authenticated.',
        };
      }

      // If not connected yet, try to connect first
      if (!this.isConnected && this.username && this.password) {
        const success = await connectToPeloton(this.username, this.password);
        if (!success) {
          return {
            success: false,
            message: 'Workout details test failed: Could not authenticate.',
          };
        }
        this.isConnected = true;
      }

      // First get a workout ID by fetching the list
      const workouts = await getPelotonWorkouts(1);
      
      if (!workouts || workouts.length === 0) {
        return {
          success: false,
          message: 'Could not test workout details: No workouts available.',
        };
      }

      // Get details for the most recent workout
      const workoutId = workouts[0].id;
      const details = await getWorkoutDetails(workoutId);
      
      if (details) {
        // Format some basic details for display
        const duration = Math.round(details.ride.duration / 60); // Convert to minutes
        
        return {
          success: true,
          message: 'Successfully retrieved workout details.',
          details: {
            workout_id: workoutId,
            duration: `${duration} minutes`,
            fitness_type: details.fitness_discipline,
          },
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve workout details.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing workout details retrieval.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run all tests and generate a comprehensive report
   * @returns PelotonTestReport with the results of all tests
   */
  async runAllTests(): Promise<PelotonTestReport> {
    // Start with credentials validation
    const credentialsResult = await this.validateCredentials();
    
    // Default values for tests that might be skipped
    let authResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid credentials',
    };
    
    let sessionResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to authentication failure',
    };
    
    let profileResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to session management failure',
    };
    
    let workoutsResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to previous test failures',
    };
    
    let workoutDetailsResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to previous test failures',
    };

    // Proceed with tests in sequence, as each depends on the previous
    if (credentialsResult.success) {
      authResult = await this.testAuthentication();
      
      if (authResult.success) {
        sessionResult = await this.testSessionManagement();
        
        if (sessionResult.success) {
          // We can run these tests in parallel since they are independent after session verification
          [profileResult, workoutsResult, workoutDetailsResult] = await Promise.all([
            this.testProfileRetrieval(),
            this.testWorkoutsRetrieval(),
            this.testWorkoutDetails(),
          ]);
        }
      }
    }

    // Determine overall status
    let overallStatus: 'success' | 'partial' | 'failed';
    
    if (
      credentialsResult.success && 
      authResult.success && 
      sessionResult.success && 
      profileResult.success && 
      workoutsResult.success && 
      workoutDetailsResult.success
    ) {
      overallStatus = 'success';
    } else if (!credentialsResult.success || !authResult.success) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'partial';
    }

    return {
      credentialsValid: credentialsResult,
      authenticationTest: authResult,
      sessionManagementTest: sessionResult,
      profileFetchTest: profileResult,
      workoutsRetrievalTest: workoutsResult,
      workoutDetailsTest: workoutDetailsResult,
      overallStatus,
    };
  }

  /**
   * Format test results into a readable string
   * @param report The test report to format
   * @returns Formatted string representation of the test report
   */
  static formatTestReport(report: PelotonTestReport): string {
    const statusEmoji = {
      success: '✅',
      failed: '❌',
      partial: '⚠️',
    };

    const resultEmoji = (result: ApiTestResult) => result.success ? '✅' : '❌';

    let output = `# Peloton API Test Report ${statusEmoji[report.overallStatus]}\n\n`;
    
    output += `## Credentials Validation ${resultEmoji(report.credentialsValid)}\n`;
    output += `${report.credentialsValid.message}\n\n`;
    
    output += `## Authentication ${resultEmoji(report.authenticationTest)}\n`;
    output += `${report.authenticationTest.message}\n\n`;
    
    output += `## Session Management ${resultEmoji(report.sessionManagementTest)}\n`;
    output += `${report.sessionManagementTest.message}\n\n`;
    
    output += `## User Profile ${resultEmoji(report.profileFetchTest)}\n`;
    output += `${report.profileFetchTest.message}\n`;
    if (report.profileFetchTest.details) {
      if (report.profileFetchTest.details.name) {
        output += `User: ${report.profileFetchTest.details.name}\n`;
      }
    }
    output += '\n';
    
    output += `## Workouts Retrieval ${resultEmoji(report.workoutsRetrievalTest)}\n`;
    output += `${report.workoutsRetrievalTest.message}\n`;
    if (report.workoutsRetrievalTest.details?.recent_workout) {
      output += `Recent workout: ${report.workoutsRetrievalTest.details.recent_workout}\n`;
    }
    output += '\n';
    
    output += `## Workout Details ${resultEmoji(report.workoutDetailsTest)}\n`;
    output += `${report.workoutDetailsTest.message}\n`;
    if (report.workoutDetailsTest.details) {
      if (report.workoutDetailsTest.details.workout_id) {
        output += `Workout ID: ${report.workoutDetailsTest.details.workout_id}\n`;
      }
      if (report.workoutDetailsTest.details.duration) {
        output += `Duration: ${report.workoutDetailsTest.details.duration}\n`;
      }
    }
    output += '\n';
    
    output += `## Overall Status: ${report.overallStatus.toUpperCase()}\n`;
    
    return output;
  }
}

/**
 * Run all Peloton API tests and return a formatted report
 * @param username Optional username for testing
 * @param password Optional password for testing
 * @returns Promise with a formatted test report
 */
export async function testPelotonApi(username?: string, password?: string): Promise<string> {
  const tester = new PelotonApiTest(username, password);
  const report = await tester.runAllTests();
  return PelotonApiTest.formatTestReport(report);
}

/**
 * Check if the provided credentials are valid
 * @param username Username or email to check
 * @param password Password to check
 * @returns True if the credentials are valid, false otherwise
 */
export async function areCredentialsValid(username: string, password: string): Promise<boolean> {
  const tester = new PelotonApiTest(username, password);
  const result = await tester.validateCredentials();
  return result.success;
}

/**
 * Test connectivity to the Peloton API
 * @returns True if connection is successful, false otherwise
 */
export async function canConnectToPeloton(): Promise<boolean> {
  const tester = new PelotonApiTest();
  const result = await tester.testAuthentication();
  return result.success;
}

export default {
  testPelotonApi,
  areCredentialsValid,
  canConnectToPeloton,
  PelotonApiTest,
};