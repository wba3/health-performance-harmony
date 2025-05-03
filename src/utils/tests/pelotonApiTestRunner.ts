import { testPelotonApi } from './pelotonApiTest';

/**
 * Run the Peloton API tests
 * @param username Optional username/email for testing
 * @param password Optional password for testing
 * @returns A Promise that resolves to the formatted test results
 */
export const runPelotonApiTests = async (
  username?: string,
  password?: string
): Promise<string> => {
  try {
    // Run the complete test suite
    const result = await testPelotonApi(username, password);
    return result;
  } catch (error) {
    // Format any errors that occur during testing
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `# Peloton API Test Error ❌\n\nAn error occurred while running Peloton API tests:\n\n${errorMessage}`;
  }
};

export default runPelotonApiTests;