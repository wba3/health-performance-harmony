import { testOuraApi } from './ouraApiTest';

/**
 * Demonstrates how to use the Oura API test utility
 * This file can be executed to run a complete API test and display results
 */
export async function runOuraTests(): Promise<void> {
  try {
    console.log('Starting Oura API tests...');
    
    // Run all tests and get the formatted report
    const testReport = await testOuraApi();
    
    // Display the test report
    console.log('\n==== Oura API Test Results ====\n');
    console.log(testReport);
    console.log('\n===============================\n');
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error running Oura API tests:', error);
    return Promise.reject(error);
  }
}

// Execute tests when this file is run directly
if (typeof window !== 'undefined') {
  // Only add event listener in browser environment
  window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('runOuraTests') === 'true') {
      runOuraTests().catch(err => console.error(err));
    }
  });
}

export default runOuraTests;