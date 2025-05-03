import {
  isOpenAIConfigured,
  generateDailyInsight,
  generateCoachResponse
} from '@/services/openaiAPI';

/**
 * Interface for API test results
 */
interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Interface for overall OpenAI test report
 */
interface OpenAITestReport {
  configurationValid: ApiTestResult;
  connectionSuccessful: ApiTestResult;
  insightGenerationTest: ApiTestResult;
  coachResponseTest: ApiTestResult;
  overallStatus: 'success' | 'partial' | 'failed';
}

/**
 * Test utility for OpenAI API integration
 * This utility validates API key configuration, tests connectivity,
 * and verifies the functionality of insights and coach responses
 */
export class OpenAIApiTest {
  private apiKey: string | null;
  private model: string;

  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key');
    this.model = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
  }

  /**
   * Validate the API key format and existence
   * @returns ApiTestResult with validation information
   */
  async validateApiKeyConfiguration(): Promise<ApiTestResult> {
    try {
      // Check if API key exists
      if (!this.apiKey) {
        return {
          success: false,
          message: 'API key is not configured. Please set up your OpenAI API key in the settings.',
        };
      }

      // Check if API key starts with expected prefix
      if (!this.apiKey.startsWith('sk-')) {
        return {
          success: false,
          message: 'API key format appears to be invalid. OpenAI API keys should start with "sk-".',
        };
      }

      // Check if API key has minimum length
      if (this.apiKey.length < 20) {
        return {
          success: false,
          message: 'API key appears to be too short. Please verify your API key.',
        };
      }

      return {
        success: true,
        message: 'API key configuration is valid.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while validating API key configuration.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test connectivity to the OpenAI API
   * @returns ApiTestResult with connectivity information
   */
  async testConnectivity(): Promise<ApiTestResult> {
    try {
      if (!isOpenAIConfigured()) {
        return {
          success: false,
          message: 'Cannot test connectivity: API key is not configured.',
        };
      }

      // Use a simple test prompt to check connectivity
      const testPrompt = "This is a connectivity test.";
      const response = await generateCoachResponse(testPrompt);

      if (response) {
        return {
          success: true,
          message: 'Successfully connected to OpenAI API.',
          details: { model: this.model },
        };
      } else {
        return {
          success: false,
          message: 'Connection test failed. Unable to generate a response.',
        };
      }
    } catch (error) {
      let errorMessage = 'An error occurred while testing connectivity.';
      let details = {};

      if (error instanceof Error) {
        // Handle standard errors
        errorMessage = `Connection failed: ${error.message}`;
        details = { error: error.message };
      } else if (typeof error === 'object' && error !== null) {
        // Handle OpenAI API errors
        const apiError = error as any;
        if (apiError.status) {
          errorMessage = `API error (status ${apiError.status}): ${apiError.message || 'Unknown error'}`;
          
          // Add more specific error messages based on status codes
          if (apiError.status === 401) {
            errorMessage = 'Authentication error: Invalid API key or token.';
          } else if (apiError.status === 429) {
            errorMessage = 'Rate limit exceeded or quota exhausted.';
          }
        }
        details = apiError;
      }

      return {
        success: false,
        message: errorMessage,
        details,
      };
    }
  }

  /**
   * Test the insight generation functionality
   * @returns ApiTestResult with insight generation information
   */
  async testInsightGeneration(): Promise<ApiTestResult> {
    try {
      if (!isOpenAIConfigured()) {
        return {
          success: false,
          message: 'Cannot test insight generation: OpenAI is not configured.',
        };
      }

      // Try to generate an insight with real data if available
      // If not, use minimal data structure that meets requirements
      let healthData;
      
      try {
        // Attempt to import real data services
        const { getTrainingData } = await import('@/services/database/trainingService');
        const { getSleepData } = await import('@/services/database/sleepService');
        
        // Try to fetch real data (last 7 days)
        const trainingResult = await getTrainingData(7).catch(() => ({ data: null, error: new Error('Failed to get training data') }));
        const sleep = await getSleepData(7).catch(() => []);
        
        const training = trainingResult.data || [];
        
        // If we have data, use it
        if ((training && training.length > 0) || (sleep && sleep.length > 0)) {
          healthData = JSON.stringify({
            training: training || [],
            sleep: sleep || []
          });
        }
      } catch (error) {
        // Data service import or fetch failed - continue with fallback
        console.log('Could not fetch real health data, using minimal structure');
      }
      
      // If we couldn't get real data, use minimal structure
      if (!healthData) {
        healthData = JSON.stringify({
          training: [],
          sleep: []
        });
      }

      // Generate a test insight with either real or minimal data
      const insight = await generateDailyInsight(healthData);

      if (insight) {
        return {
          success: true,
          message: 'Successfully generated a test insight.',
          details: { insight: insight.substring(0, 100) + '...' }, // Truncate for readability
        };
      } else {
        return {
          success: false,
          message: 'Failed to generate insight.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing insight generation.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test the coach response functionality
   * @returns ApiTestResult with coach response information
   */
  async testCoachResponse(): Promise<ApiTestResult> {
    try {
      if (!isOpenAIConfigured()) {
        return {
          success: false,
          message: 'Cannot test coach response: OpenAI is not configured.',
        };
      }

      // General health/fitness related question that works without personal data context
      const testQuestion = 'What are some effective recovery strategies after intense workouts?';

      // Generate a test coach response
      const response = await generateCoachResponse(testQuestion);

      if (response) {
        return {
          success: true,
          message: 'Successfully generated a test coach response.',
          details: { response: response.substring(0, 100) + '...' }, // Truncate for readability
        };
      } else {
        return {
          success: false,
          message: 'Failed to generate coach response.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while testing coach response generation.',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run all tests and generate a comprehensive report
   * @returns OpenAITestReport with the results of all tests
   */
  async runAllTests(): Promise<OpenAITestReport> {
    const configResult = await this.validateApiKeyConfiguration();
    
    // Only proceed with further tests if configuration is valid
    let connectResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid configuration',
    };
    
    let insightResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid configuration',
    };
    
    let coachResult: ApiTestResult = {
      success: false,
      message: 'Skipped due to invalid configuration',
    };

    if (configResult.success) {
      connectResult = await this.testConnectivity();
      
      if (connectResult.success) {
        // Run these tests in parallel since they are independent
        [insightResult, coachResult] = await Promise.all([
          this.testInsightGeneration(),
          this.testCoachResponse(),
        ]);
      }
    }

    // Determine overall status
    let overallStatus: 'success' | 'partial' | 'failed';
    
    if (configResult.success && connectResult.success && insightResult.success && coachResult.success) {
      overallStatus = 'success';
    } else if (!configResult.success) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'partial';
    }

    return {
      configurationValid: configResult,
      connectionSuccessful: connectResult,
      insightGenerationTest: insightResult,
      coachResponseTest: coachResult,
      overallStatus,
    };
  }

  /**
   * Format test results into a readable string
   * @param report The test report to format
   * @returns Formatted string representation of the test report
   */
  static formatTestReport(report: OpenAITestReport): string {
    const statusEmoji = {
      success: '✅',
      failed: '❌',
      partial: '⚠️',
    };

    const resultEmoji = (result: ApiTestResult) => result.success ? '✅' : '❌';

    let output = `# OpenAI API Test Report ${statusEmoji[report.overallStatus]}\n\n`;
    
    output += `## Configuration ${resultEmoji(report.configurationValid)}\n`;
    output += `${report.configurationValid.message}\n\n`;
    
    output += `## Connectivity ${resultEmoji(report.connectionSuccessful)}\n`;
    output += `${report.connectionSuccessful.message}\n\n`;
    
    output += `## Insight Generation ${resultEmoji(report.insightGenerationTest)}\n`;
    output += `${report.insightGenerationTest.message}\n`;
    if (report.insightGenerationTest.details?.insight) {
      output += `Sample: ${report.insightGenerationTest.details.insight}\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Coach Response ${resultEmoji(report.coachResponseTest)}\n`;
    output += `${report.coachResponseTest.message}\n`;
    if (report.coachResponseTest.details?.response) {
      output += `Sample: ${report.coachResponseTest.details.response}\n\n`;
    } else {
      output += '\n';
    }
    
    output += `## Overall Status: ${report.overallStatus.toUpperCase()}\n`;
    
    return output;
  }
}

/**
 * Run all OpenAI API tests and return a formatted report
 * @returns Promise with a formatted test report
 */
export async function testOpenAIApi(): Promise<string> {
  const tester = new OpenAIApiTest();
  const report = await tester.runAllTests();
  return OpenAIApiTest.formatTestReport(report);
}

/**
 * Check if the API key is valid and properly formatted
 * @returns True if the API key is valid, false otherwise
 */
export async function isApiKeyValid(): Promise<boolean> {
  const tester = new OpenAIApiTest();
  const result = await tester.validateApiKeyConfiguration();
  return result.success;
}

/**
 * Test connectivity to the OpenAI API
 * @returns True if connection is successful, false otherwise
 */
export async function canConnectToOpenAI(): Promise<boolean> {
  const tester = new OpenAIApiTest();
  const result = await tester.testConnectivity();
  return result.success;
}

export default {
  testOpenAIApi,
  isApiKeyValid,
  canConnectToOpenAI,
  OpenAIApiTest,
};