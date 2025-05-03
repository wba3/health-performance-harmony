import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { testOpenAIApi, isApiKeyValid, canConnectToOpenAI, OpenAIApiTest } from '@/utils/tests/openaiApiTest';

/**
 * OpenAI API Tester Component
 * Provides a UI for testing the OpenAI API integration
 */
const OpenAIApiTester: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'success' | 'partial' | 'failed' | null>(null);

  /**
   * Run all OpenAI API tests
   */
  const runTests = async () => {
    setLoading(true);
    setTestResults(null);
    setTestStatus(null);

    try {
      // First check if API key is valid
      const keyValid = await isApiKeyValid();
      if (!keyValid) {
        setTestStatus('failed');
        setTestResults('API key validation failed. Please check your API key configuration in the settings.');
        setLoading(false);
        return;
      }

      // Run the full test suite
      const results = await testOpenAIApi();
      
      // Determine overall status from the test results
      const overallStatus = results.includes('Overall Status: SUCCESS') 
        ? 'success' 
        : results.includes('Overall Status: FAILED')
          ? 'failed'
          : 'partial';
      
      setTestStatus(overallStatus);
      setTestResults(results);
    } catch (error) {
      setTestStatus('failed');
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
        <CardTitle className="text-lg font-semibold">OpenAI API Test Utility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Test your OpenAI API integration to ensure it's properly configured and functioning.
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
                Test OpenAI Integration
              </>
            )}
          </Button>
        </div>

        {testStatus && (
          <Alert variant={
            testStatus === 'success' ? 'default' :
            testStatus === 'partial' ? 'warning' : 'destructive'
          } className="mt-4">
            <div className="flex items-center">
              {testStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              {testStatus === 'partial' && <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />}
              {testStatus === 'failed' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
              <AlertTitle>
                {testStatus === 'success' ? 'All Tests Passed' :
                 testStatus === 'partial' ? 'Some Tests Failed' : 'Tests Failed'}
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

export default OpenAIApiTester;