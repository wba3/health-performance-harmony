import React, { useState, useEffect } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { Settings as SettingsIcon, User2, Lock, Bell, ExternalLink, Laptop, Moon, Key, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { initiateOuraAuth, handleOuraCallback, isOuraConnected, disconnectOura, importOuraSleepData } from "@/services/ouraAPI";
import { initiateStravaAuth, handleStravaCallback, isStravaConnected, disconnectStrava, importStravaActivities, testStravaConnection } from "@/services/stravaAPI";

const Settings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Oura connection state
  const [ouraConnected, setOuraConnected] = useState<boolean>(false);
  const [ouraClientId, setOuraClientId] = useState<string>('');
  const [ouraClientSecret, setOuraClientSecret] = useState<string>('');
  const [ouraAutoSync, setOuraAutoSync] = useState<boolean>(false);
  const [processingOuraAuth, setProcessingOuraAuth] = useState<boolean>(false);
  const [importingOuraData, setImportingOuraData] = useState<boolean>(false);

  // Strava connection state
  const [stravaConnected, setStravaConnected] = useState<boolean>(false);
  const [stravaClientId, setStravaClientId] = useState<string>('');
  const [stravaClientSecret, setStravaClientSecret] = useState<string>('');
  const [stravaAutoImport, setStravaAutoImport] = useState<boolean>(false);
  const [stravaPowerData, setStravaPowerData] = useState<boolean>(false);
  const [processingStravaAuth, setProcessingStravaAuth] = useState<boolean>(false);
  const [importingStravaData, setImportingStravaData] = useState<boolean>(false);

  // OpenAI API state
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [openAIModel, setOpenAIModel] = useState<string>('gpt-4o');
  const [openAIDailyInsights, setOpenAIDailyInsights] = useState<boolean>(false);
  const [openAIConnected, setOpenAIConnected] = useState<boolean>(false);

  // Check connections on mount
  useEffect(() => {
    const checkConnections = () => {
      setOuraConnected(isOuraConnected());
      setStravaConnected(isStravaConnected());
      
      // Check OpenAI configuration
      const savedOpenAIKey = localStorage.getItem('openai_api_key');
      if (savedOpenAIKey) {
        setOpenAIConnected(true);
        setOpenAIKey(savedOpenAIKey);
      }
    };

    checkConnections();

    // Load saved client IDs
    const savedOuraClientId = localStorage.getItem('ouraClientId');
    const savedOuraClientSecret = localStorage.getItem('ouraClientSecret');
    const savedStravaClientId = localStorage.getItem('stravaClientId');
    const savedStravaClientSecret = localStorage.getItem('stravaClientSecret');
    
    if (savedOuraClientId) {
      setOuraClientId(savedOuraClientId);
    }
    
    if (savedOuraClientSecret) {
      setOuraClientSecret(savedOuraClientSecret);
    }
    
    if (savedStravaClientId) {
      setStravaClientId(savedStravaClientId);
    }
    
    if (savedStravaClientSecret) {
      setStravaClientSecret(savedStravaClientSecret);
    }
  }, []);

  // Handle OAuth callbacks
  useEffect(() => {
    // Process OAuth callback if code is present
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // Check if it's a Strava callback (Strava uses state parameter)
      if (localStorage.getItem('strava_auth_state') === state) {
        handleStravaOAuthCallback(code, state);
      } 
      // Otherwise assume it's an Oura callback
      else if (ouraClientId && ouraClientSecret) {
        handleOuraOAuthCallback(code, state);
      }
    }
  }, [searchParams]);

  // Handle Oura OAuth callback
  const handleOuraOAuthCallback = (code: string, state: string) => {
    setProcessingOuraAuth(true);
    
    handleOuraCallback(code, state, ouraClientId, ouraClientSecret)
      .then(success => {
        if (success) {
          setOuraConnected(true);
          toast({
            title: "Connected to Oura",
            description: "Your Oura Ring account has been successfully connected.",
            variant: "default",
          });
        } else {
          toast({
            title: "Connection Failed",
            description: "Could not connect to Oura. Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch(err => {
        console.error("Error handling Oura OAuth callback:", err);
        toast({
          title: "Connection Error",
          description: err.message || "An error occurred during the connection process.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setProcessingOuraAuth(false);
        
        // Clear URL parameters after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      });
  };

  // Handle Strava OAuth callback
  const handleStravaOAuthCallback = (code: string, state: string) => {
    setProcessingStravaAuth(true);
    
    console.log('Processing Strava OAuth callback with code:', code.substring(0, 5) + '...');
    console.log('Client ID being used:', stravaClientId);
    
    handleStravaCallback(code, state, stravaClientId, stravaClientSecret)
      .then(success => {
        if (success) {
          setStravaConnected(true);
          toast({
            title: "Connected to Strava",
            description: "Your Strava account has been successfully connected.",
            variant: "default",
          });
          
          // Test the connection
          return testStravaConnection(stravaClientId, stravaClientSecret);
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
        setStravaConnected(false);
        toast({
          title: "Connection Error",
          description: err.message || "An error occurred during the connection process.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setProcessingStravaAuth(false);
        
        // Clear URL parameters after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      });
  };

  // Connect to Oura
  const handleOuraConnect = () => {
    if (!ouraClientId) {
      toast({
        title: "Client ID Required",
        description: "Please enter your Oura API Client ID.",
        variant: "destructive",
      });
      return;
    }
    
    // Save client credentials to use after OAuth redirect
    localStorage.setItem('ouraClientId', ouraClientId);
    if (ouraClientSecret) {
      localStorage.setItem('ouraClientSecret', ouraClientSecret);
    }
    
    initiateOuraAuth(ouraClientId);
  };

  // Connect to Strava
  const handleStravaConnect = () => {
    if (!stravaClientId) {
      toast({
        title: "Client ID Required",
        description: "Please enter your Strava API Client ID.",
        variant: "destructive",
      });
      return;
    }
    
    if (!stravaClientSecret) {
      toast({
        title: "Client Secret Required",
        description: "Please enter your Strava API Client Secret.",
        variant: "destructive",
      });
      return;
    }
    
    // Save client credentials to use after OAuth redirect
    localStorage.setItem('stravaClientId', stravaClientId);
    localStorage.setItem('stravaClientSecret', stravaClientSecret);
    
    // Start the OAuth flow
    initiateStravaAuth(stravaClientId);
  };

  // Disconnect from Oura
  const handleOuraDisconnect = () => {
    disconnectOura();
    setOuraConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Oura Ring account has been disconnected.",
      variant: "default",
    });
  };

  // Disconnect from Strava
  const handleStravaDisconnect = () => {
    disconnectStrava();
    setStravaConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Strava account has been disconnected.",
      variant: "default",
    });
  };

  // Import Oura sleep data
  const handleImportSleepData = async () => {
    if (!ouraConnected || !ouraClientId || !ouraClientSecret) {
      toast({
        title: "Not Connected",
        description: "Please connect to Oura before importing data.",
        variant: "destructive",
      });
      return;
    }
    
    setImportingOuraData(true);
    
    try {
      const importCount = await importOuraSleepData(ouraClientId, ouraClientSecret, 30);
      
      toast({
        title: "Data Imported",
        description: `Successfully imported ${importCount} days of sleep data.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Could not import sleep data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImportingOuraData(false);
    }
  };

  // Import Strava activities
  const handleImportActivities = async () => {
    if (!stravaConnected || !stravaClientId || !stravaClientSecret) {
      toast({
        title: "Not Connected",
        description: "Please connect to Strava before importing data.",
        variant: "destructive",
      });
      return;
    }
    
    setImportingStravaData(true);
    
    try {
      const importCount = await importStravaActivities(stravaClientId, stravaClientSecret, 30);
      
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
      setImportingStravaData(false);
    }
  };

  // Connect to OpenAI
  const handleOpenAIConnect = () => {
    if (!openAIKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }
    
    // Store API key in localStorage
    localStorage.setItem('openai_api_key', openAIKey);
    setOpenAIConnected(true);
    
    toast({
      title: "Connected to OpenAI",
      description: "Your OpenAI API key has been saved.",
      variant: "default",
    });
  };

  // Disconnect from OpenAI
  const handleOpenAIDisconnect = () => {
    localStorage.removeItem('openai_api_key');
    setOpenAIConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Your OpenAI API key has been removed.",
      variant: "default",
    });
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <section className="mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account, API connections, and application preferences
            </p>
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <nav className="space-y-1 hidden md:block">
            <Button variant="ghost" className="w-full justify-start">
              <User2 className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start bg-muted">
              <Key className="w-4 h-4 mr-2" />
              API Connections
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Laptop className="w-4 h-4 mr-2" />
              Appearance
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </Button>
          </nav>

          <div>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">API Connections</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Connect your sleep and training services to enable health and performance tracking
                </p>
              </div>
              
              <div className="space-y-8">
                {/* Oura Ring Connection */}
                <div className="rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                        <Moon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Oura Ring</h3>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground mr-2">Sleep and recovery data</p>
                          {ouraConnected && (
                            <span className="inline-flex items-center text-xs text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {ouraConnected ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={handleImportSleepData}
                          disabled={importingOuraData}
                        >
                          {importingOuraData ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            "Import Data"
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={handleOuraDisconnect}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={handleOuraConnect}
                        disabled={processingOuraAuth}
                      >
                        {processingOuraAuth ? (
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
                          <Label htmlFor="oura-client-id">Client ID</Label>
                          <Input 
                            id="oura-client-id" 
                            placeholder="Enter client ID" 
                            value={ouraClientId}
                            onChange={(e) => {
                              setOuraClientId(e.target.value);
                              localStorage.setItem('ouraClientId', e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oura-client-secret">Client Secret</Label>
                          <Input 
                            id="oura-client-secret" 
                            type="password" 
                            placeholder="••••••••••••••••"
                            value={ouraClientSecret}
                            onChange={(e) => {
                              setOuraClientSecret(e.target.value);
                              localStorage.setItem('ouraClientSecret', e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="oura-auto-sync" 
                          checked={ouraAutoSync}
                          onCheckedChange={setOuraAutoSync}
                        />
                        <Label htmlFor="oura-auto-sync">Auto-sync sleep data daily</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Strava Connection */}
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
                          {stravaConnected && (
                            <span className="inline-flex items-center text-xs text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {stravaConnected ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={handleImportActivities}
                          disabled={importingStravaData}
                        >
                          {importingStravaData ? (
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
                          onClick={handleStravaDisconnect}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={handleStravaConnect}
                        disabled={processingStravaAuth}
                      >
                        {processingStravaAuth ? (
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
                            value={stravaClientId}
                            onChange={(e) => {
                              setStravaClientId(e.target.value);
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
                            value={stravaClientSecret}
                            onChange={(e) => {
                              setStravaClientSecret(e.target.value);
                              localStorage.setItem('stravaClientSecret', e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="strava-auto-import"
                          checked={stravaAutoImport}
                          onCheckedChange={setStravaAutoImport}
                        />
                        <Label htmlFor="strava-auto-import">Auto-import new activities</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="strava-power-data"
                          checked={stravaPowerData}
                          onCheckedChange={setStravaPowerData}
                        />
                        <Label htmlFor="strava-power-data">Include power data</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* OpenAI Connection */}
                <div className="rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#74aa9c] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0097 6.0097 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-4.9107.5216 6.0462 6.0462 0 0 0-2.9001 6.5099 6.0097 6.0097 0 0 0 2.1713 11.2718c1.4884.6182 3.1953.6182 4.6837 0a6.0462 6.0462 0 0 0 6.5099-2.9001 6.0097 6.0097 0 0 0 11.2728-2.1713 5.9845 5.9845 0 0 0 .5157-4.9108Z" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">OpenAI</h3>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground mr-2">AI-powered insights and coaching</p>
                          {openAIConnected && (
                            <span className="inline-flex items-center text-xs text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {openAIConnected ? (
                      <Button 
                        variant="outline" 
                        className="text-red-500 hover:text-red-600"
                        onClick={handleOpenAIDisconnect}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="flex items-center gap-2"
                        onClick={handleOpenAIConnect}
                      >
                        <span>Connect</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Separator />
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="openai-api-key">API Key</Label>
                        <Input 
                          id="openai-api-key" 
                          type="password" 
                          placeholder="sk-••••••••••••••••"
                          value={openAIKey}
                          onChange={(e) => setOpenAIKey(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openai-model">GPT Model</Label>
                        <select
                          id="openai-model"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={openAIModel}
                          onChange={(e) => setOpenAIModel(e.target.value)}
                        >
                          <option value="gpt-4o">gpt-4o</option>
                          <option value="gpt-4o-mini">gpt-4o-mini</option>
                          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="openai-daily-insights"
                          checked={openAIDailyInsights}
                          onCheckedChange={setOpenAIDailyInsights}
                        />
                        <Label htmlFor="openai-daily-insights">Generate daily insights</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
