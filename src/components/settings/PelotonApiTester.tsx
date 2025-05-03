import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { testPelotonApi, canConnectToPeloton } from '@/utils/tests/pelotonApiTest';

/**
 * Peloton API Tester Component
 * Provides a UI for testing the Peloton API integration
 */
const PelotonApiTester: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'success' | 'partial' | 'failed' | null>(null);

  /**
   * Run all Peloton API tests
   */
  const runTests = async () => {
    setLoading(true);
    setTestResults(null);
    setTestStatus(null);

    try {
      // Check if we can connect to Peloton
      const canConnect = await canConnectToPeloton();
      if (!canConnect) {
        setTestStatus('failed');
        setTestResults('Peloton connection failed. Please check your login credentials in the settings above and ensure you are connected.');
        setLoading(false);
        return;
      }

      // Run the full test suite
      const results = await testPelotonApi();
      
      // Determine overall status from the test results
      let overallStatus: 'success' | 'partial' | 'failed';
      
      if (results.includes('# Peloton API Test Report ✅')) {
        overallStatus = 'success';
      } else if (results.includes('# Peloton API Test Report ❌')) {
        overallStatus = 'failed';
      } else if (results.includes('# Peloton API Test Report ⚠️')) {
        overallStatus = 'partial';
      } else {
        // Default to partial if we can't determine the status
        overallStatus = 'partial';
      }
      
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
      } else if (line.trim().startsWith('{') || line.includes('details:')) {
        return <div key={index} className="bg-slate-100 dark:bg-slate-800 p-2 rounded my-1 text-sm font-mono">{line}</div>;
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
        <CardTitle className="text-lg font-semibold">Peloton API Test Utility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Test your Peloton API integration to ensure it's properly configured and functioning. 
            This will validate credentials, test authentication, session management, and API connectivity.
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
                Test Peloton Integration
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

export default PelotonApiTester;