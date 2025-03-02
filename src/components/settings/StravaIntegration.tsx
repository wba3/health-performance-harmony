import React, { useState } from "react";
import { Info, CheckCircle, XCircle, Loader2, ExternalLink, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  initiateStravaAuth, 
  handleStravaCallback, 
  isStravaConnected, 
  disconnectStrava, 
  importStravaActivities, 
  testStravaConnection 
} from "@/services/stravaAPI";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface StravaIntegrationProps {
  processingAuth: boolean;
  setProcessingAuth: (processing: boolean) => void;
}

const StravaIntegration: React.FC<StravaIntegrationProps> = ({ 
  processingAuth, 
  setProcessingAuth 
}) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Strava connection state
  const [connected, setConnected] = useState<boolean>(isStravaConnected());
  const [clientId, setClientId] = useState<string>(localStorage.getItem('stravaClientId') || '');
  const [clientSecret, setClientSecret] = useState<string>(localStorage.getItem('stravaClientSecret') || '');
  const [autoImport, setAutoImport] = useState<boolean>(false);
  const [powerData, setPowerData] = useState<boolean>(false);
  const [importingData, setImportingData] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Extract domain for Strava settings
  const appDomain = window.location.origin.replace(/^https?:\/\//, '').split('/')[0];
  // Create a Strava-compatible domain (without dashes) for their Authorization Callback Domain field
  const stravaDomain = appDomain.replace(/-/g, '');
  const redirectUri = `${window.location.origin}/settings`;

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
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#FC4C02] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.387 17.944V22L14.5 20.444L13.613 22V17.944H15.387ZM13.613 2V10.5L14.5 12.056L15.387 10.5V2H13.613Z" fill="white"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Strava</h3>
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground mr-2">Training and workout data</p>
              {connected && (
                <span className="inline-flex items-center text-xs text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </span>
              )}
            </div>
          </div>
        </div>
        {connected ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleImportData}
              disabled={importingData}
            >
              {importingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Activities"
              )}
            </Button>
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              onClick={handleDisconnect}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleConnect}
            disabled={processingAuth}
          >
            {processingAuth ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
      <Separator />
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strava-client-id">Client ID</Label>
              <Input 
                id="strava-client-id" 
                placeholder="Enter client ID"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  localStorage.setItem('stravaClientId', e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strava-client-secret">Client Secret</Label>
              <Input 
                id="strava-client-secret" 
                type="password" 
                placeholder="••••••••••••••••"
                value={clientSecret}
                onChange={(e) => {
                  setClientSecret(e.target.value);
                  localStorage.setItem('stravaClientSecret', e.target.value);
                }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mt-2">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 flex items-center">
                  Strava API Configuration 
                  <a 
                    href="https://www.strava.com/settings/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-xs inline-flex items-center text-amber-700 underline"
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Open Strava API Settings
                  </a>
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  In your Strava API settings, you <strong>MUST</strong> configure <strong>EXACTLY</strong> as follows:
                </p>
                <ol className="text-sm text-amber-700 mt-2 space-y-2 list-decimal pl-5">
                  <li>
                    <div className="font-medium">Authorization Callback Domain:</div>
                    <code className="bg-amber-100 px-2 py-1 rounded block mt-1 break-all select-all">{stravaDomain}</code>
                    <div className="italic text-xs mt-1">
                      ⚠️ Important: <strong>DO NOT</strong> include http://, www, or slashes
                    </div>
                    {appDomain !== stravaDomain && (
                      <div className="bg-red-100 p-2 rounded mt-1 text-red-700">
                        <strong>IMPORTANT:</strong> Strava doesn't allow dashes (-) in this field. 
                        Use the domain <strong>without dashes</strong> as shown above.
                      </div>
                    )}
                  </li>
                  <li>
                    <div className="font-medium">Requested Scopes:</div>
                    <div className="bg-amber-100 px-2 py-1 rounded mt-1">
                      ✓ Read permission
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="strava-auto-import"
              checked={autoImport}
              onCheckedChange={setAutoImport}
            />
            <Label htmlFor="strava-auto-import">Auto-import new activities</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="strava-power-data"
              checked={powerData}
              onCheckedChange={setPowerData}
            />
            <Label htmlFor="strava-power-data">Include power data</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { StravaIntegration, type StravaIntegrationProps };
