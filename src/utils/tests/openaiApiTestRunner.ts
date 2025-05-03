import { testOpenAIApi } from './openaiApiTest';

/**
 * Demonstrates how to use the OpenAI API test utility
 * This file can be executed to run a complete API test and display results
 */
export async function runOpenAITests(): Promise<void> {
  try {
    console.log('Starting OpenAI API tests...');
    
    // Run all tests and get the formatted report
    const testReport = await testOpenAIApi();
    
    // Display the test report
    console.log('\n==== OpenAI API Test Results ====\n');
    console.log(testReport);
    console.log('\n=================================\n');
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error running OpenAI API tests:', error);
    return Promise.reject(error);
  }
}

// Execute tests when this file is run directly
if (typeof window !== 'undefined') {
  // Only add event listener in browser environment
  window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('runTests') === 'true') {
      runOpenAITests().catch(err => console.error(err));
    }
  });
}

export default runOpenAITests;