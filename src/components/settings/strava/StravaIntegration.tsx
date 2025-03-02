
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  initiateStravaAuth, 
  handleStravaCallback, 
  isStravaConnected, 
  disconnectStrava, 
  importStravaActivities, 
  testStravaConnection 
} from "@/services/stravaAPI";

// Import the refactored components
import StravaHeader from "./StravaHeader";
import StravaApiConfig from "./StravaApiConfig";
import StravaPreferences from "./StravaPreferences";

interface StravaIntegrationProps {
  processingAuth: boolean;
  setProcessingAuth: (processing: boolean) => void;
}

const StravaIntegration: React.FC<StravaIntegrationProps> = ({ 
  processingAuth, 
  setProcessingAuth 
}) => {
  const { toast } = useToast();
  
  // Strava connection state
  const [connected, setConnected] = useState<boolean>(isStravaConnected());
  const [clientId, setClientId] = useState<string>(localStorage.getItem('stravaClientId') || '');
  const [clientSecret, setClientSecret] = useState<string>(localStorage.getItem('stravaClientSecret') || '');
  const [autoImport, setAutoImport] = useState<boolean>(false);
  const [powerData, setPowerData] = useState<boolean>(false);
  const [importingData, setImportingData] = useState<boolean>(false);

  // Extract domain for Strava settings
  const appDomain = window.location.origin.replace(/^https?:\/\//, '').split('/')[0];
  // Create a Strava-compatible domain (without dashes) for their Authorization Callback Domain field
  const stravaDomain = appDomain.replace(/-/g, '');
  const redirectUri = `${window.location.origin}/settings`;

  // Process OAuth callback if present in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (code && state && localStorage.getItem('strava_auth_state') === state) {
      processOAuthCallback(code, state);
    }
  }, []);

  // Connect to Strava
  const handleConnect = () => {
    if (!clientId) {
      toast({
        title: "Client ID Required",
        description: "Please enter your Strava API Client ID.",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientSecret) {
      toast({
        title: "Client Secret Required",
        description: "Please enter your Strava API Client Secret.",
        variant: "destructive",
      });
      return;
    }
    
    // Save client credentials to use after OAuth redirect
    localStorage.setItem('stravaClientId', clientId);
    localStorage.setItem('stravaClientSecret', clientSecret);
    
    // Start the OAuth flow
    initiateStravaAuth(clientId);
  };

  // Disconnect from Strava
  const handleDisconnect = () => {
    disconnectStrava();
    setConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Strava account has been disconnected.",
      variant: "default",
    });
  };

  // Import Strava activities
  const handleImportData = async () => {
    if (!connected || !clientId || !clientSecret) {
      toast({
        title: "Not Connected",
        description: "Please connect to Strava before importing data.",
        variant: "destructive",
      });
      return;
    }
    
    setImportingData(true);
    
    try {
      const importCount = await importStravaActivities(clientId, clientSecret, 30);
      
      toast({
        title: "Activities Imported",
        description: `Successfully imported ${importCount} activities.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Could not import activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImportingData(false);
    }
  };

  // Handle Strava OAuth callback
  const processOAuthCallback = (code: string, state: string) => {
    setProcessingAuth(true);
    
    console.log('Processing Strava OAuth callback with code:', code.substring(0, 5) + '...');
    console.log('Client ID being used:', clientId);
    
    handleStravaCallback(code, state, clientId, clientSecret)
      .then(success => {
        if (success) {
          setConnected(true);
          toast({
            title: "Connected to Strava",
            description: "Your Strava account has been successfully connected.",
            variant: "default",
          });
          
          // Test the connection
          return testStravaConnection(clientId, clientSecret);
        } else {
          throw new Error("Failed to connect to Strava");
        }
      })
      .then(connectionWorking => {
        if (!connectionWorking) {
          console.warn("Strava connected but API test failed");
          toast({
            title: "Connection Warning",
            description: "Connected to Strava, but API test failed. You may need to check your credentials.",
            variant: "warning",
          });
        }
      })
      .catch(err => {
        console.error("Error handling Strava OAuth callback:", err);
        setConnected(false);
        toast({
          title: "Connection Error",
          description: err.message || "An error occurred during the connection process.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setProcessingAuth(false);
        
        // Clear URL parameters after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      });
  };

  return (
    <div className="rounded-lg border shadow-sm">
      <StravaHeader 
        connected={connected}
        processingAuth={processingAuth}
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
        importingData={importingData}
        handleImportData={handleImportData}
      />
      
      <Separator />
      
      <div className="p-6">
        <div className="space-y-4">
          <StravaApiConfig 
            clientId={clientId}
            setClientId={setClientId}
            clientSecret={clientSecret}
            setClientSecret={setClientSecret}
            stravaDomain={stravaDomain}
            appDomain={appDomain}
          />
          
          <StravaPreferences 
            autoImport={autoImport}
            setAutoImport={setAutoImport}
            powerData={powerData}
            setPowerData={setPowerData}
          />
        </div>
      </div>
    </div>
  );
};

export { StravaIntegration, type StravaIntegrationProps };
