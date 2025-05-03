import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { testOuraApi, areCredentialsValid, canConnectToOura } from '@/utils/tests/ouraApiTest';

/**
 * Oura API Tester Component
 * Provides a UI for testing the Oura Ring API integration
 */
const OuraApiTester: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'SUCCESS' | 'PARTIAL' | 'FAILED' | null>(null);

  /**
   * Run all Oura API tests
   */
  const runTests = async () => {
    setLoading(true);
    setTestResults(null);
    setTestStatus(null);

    try {
      // First check if credentials are valid
      const credsValid = await areCredentialsValid();
      if (!credsValid) {
        setTestStatus('FAILED');
        setTestResults('Oura API credentials validation failed. Please check your Client ID and Client Secret configuration in the settings.');
        setLoading(false);
        return;
      }

      // Run the full test suite
      const results = await testOuraApi();
      
      // Determine overall status from the test results
      const overallStatus = results.includes('Overall Status: SUCCESS') 
        ? 'SUCCESS' 
        : results.includes('Overall Status: FAILED')
          ? 'FAILED'
          : 'PARTIAL';
      
      setTestStatus(overallStatus);
      setTestResults(results);
    } catch (error) {
      setTestStatus('FAILED');
      setTestResults(`An error occurred while running tests: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format the test results for display
   */
  const formatResults = (results: string): React.ReactNode => {
    if (!results) return null;

    // Simple Markdown-like formatting
    return results.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-semibold mt-3 mb-1">{line.substring(3)}</h2>;
      } else if (line.startsWith('Sample:')) {
        return <div key={index} className="bg-slate-100 dark:bg-slate-800 p-2 rounded my-1 text-sm">{line}</div>;
      } else if (
        line.startsWith('Token expires at:') || 
        line.startsWith('Status:') || 
        line.startsWith('Sleep records:') ||
        line.startsWith('Records imported:') ||
        line.startsWith('Note:')
      ) {
        return <div key={index} className="bg-slate-100 dark:bg-slate-800 p-2 rounded my-1 text-sm">{line}</div>;
      } else if (line.trim() === '') {
        return <div key={index} className="my-1"></div>;
      } else {
        return <p key={index} className="my-1">{line}</p>;
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Oura API Test Utility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Test your Oura Ring API integration to ensure it's properly configured and functioning. 
            This utility validates credentials, tests authentication, token refresh, API connectivity,
            and data import functionality.
          </p>
          <Button
            onClick={runTests}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                Test Oura Ring Integration
              </>
            )}
          </Button>
        </div>

        {testStatus && (
          <Alert variant={
            testStatus === 'SUCCESS' ? 'default' :
            testStatus === 'PARTIAL' ? 'warning' : 'destructive'
          } className="mt-4">
            <div className="flex items-center">
              {testStatus === 'SUCCESS' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              {testStatus === 'PARTIAL' && <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />}
              {testStatus === 'FAILED' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
              <AlertTitle>
                {testStatus === 'SUCCESS' ? 'All Tests Passed' :
                 testStatus === 'PARTIAL' ? 'Some Tests Failed' : 'Tests Failed'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {testResults ? (
                <div className="max-h-96 overflow-y-auto mt-2 text-sm">
                  {formatResults(testResults)}
                </div>
              ) : (
                <p>No test results available.</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default OuraApiTester;