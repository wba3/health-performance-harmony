
import React, { useState, useEffect } from "react";
import { Moon, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  initiateOuraAuth, 
  handleOuraCallback, 
  isOuraConnected, 
  disconnectOura, 
  importOuraSleepData 
} from "@/services/ouraAPI";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface OuraIntegrationProps {
  processingAuth: boolean;
  setProcessingAuth: (processing: boolean) => void;
}

const OuraIntegration: React.FC<OuraIntegrationProps> = ({ 
  processingAuth, 
  setProcessingAuth 
}) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Oura connection state - Fix: Initialize with false instead of promise
  const [connected, setConnected] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>(localStorage.getItem('ouraClientId') || '');
  const [clientSecret, setClientSecret] = useState<string>(localStorage.getItem('ouraClientSecret') || '');
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [importingData, setImportingData] = useState<boolean>(false);

  // Check connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await isOuraConnected();
        setConnected(isConnected);
      } catch (err) {
        console.error("Error checking Oura connection:", err);
      }
    };
    
    checkConnection();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Connect to Oura
  const handleConnect = () => {
    if (!clientId) {
      toast({
        title: "Client ID Required",
        description: "Please enter your Oura API Client ID.",
        variant: "destructive",
      });
      return;
    }
    
    // Save client credentials to use after OAuth redirect
    localStorage.setItem('ouraClientId', clientId);
    if (clientSecret) {
      localStorage.setItem('ouraClientSecret', clientSecret);
    }
    
    initiateOuraAuth(clientId);
  };

  // Disconnect from Oura
  const handleDisconnect = () => {
    disconnectOura();
    setConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Oura Ring account has been disconnected.",
      variant: "default",
    });
  };

  // Import Oura sleep data
  const handleImportData = async () => {
    if (!connected || !clientId || !clientSecret) {
      toast({
        title: "Not Connected",
        description: "Please connect to Oura before importing data.",
        variant: "destructive",
      });
      return;
    }
    
    setImportingData(true);
    
    try {
      const importCount = await importOuraSleepData(clientId, clientSecret, 30);
      
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
      setImportingData(false);
    }
  };

  // Handle Oura OAuth callback
  const processOAuthCallback = (code: string, state: string) => {
    setProcessingAuth(true);
    
    handleOuraCallback(code, state, clientId, clientSecret)
      .then(success => {
        if (success) {
          setConnected(true);
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
        setProcessingAuth(false);
        
        // Clear URL parameters after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      });
  };

  return (
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
                "Import Data"
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
              <Label htmlFor="oura-client-id">Client ID</Label>
              <Input 
                id="oura-client-id" 
                placeholder="Enter client ID" 
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
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
                value={clientSecret}
                onChange={(e) => {
                  setClientSecret(e.target.value);
                  localStorage.setItem('ouraClientSecret', e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="oura-auto-sync" 
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
            <Label htmlFor="oura-auto-sync">Auto-sync sleep data daily</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { OuraIntegration, type OuraIntegrationProps };
