
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { isOuraConnected, clearOuraCredentials } from "@/services/ouraAPI";

interface OuraIntegrationProps {
  processingAuth: boolean;
  setProcessingAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const OuraIntegration: React.FC<OuraIntegrationProps> = ({ 
  processingAuth, 
  setProcessingAuth 
}) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      setIsLoading(true);
      try {
        // Fix: await the promise and set the boolean result
        const status = await isOuraConnected();
        setConnected(status);
      } catch (error) {
        console.error("Error checking Oura connection:", error);
        setConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionStatus();
  }, []);

  const handleConnect = () => {
    // Client ID should be stored as an environment variable
    const clientId = process.env.REACT_APP_OURA_CLIENT_ID || "YOUR_OURA_CLIENT_ID";
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/settings`
    );
    const scope = encodeURIComponent(
      "daily email heartrate personal profile session tag workout"
    );
    
    // Save that we're in the Oura auth flow
    localStorage.setItem('ouraClientId', clientId);
    
    // Redirect to Oura auth page
    window.location.href = `https://cloud.ouraring.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await clearOuraCredentials();
      setConnected(false);
      toast({
        title: "Oura Ring Disconnected",
        description: "Successfully disconnected your Oura Ring account.",
      });
    } catch (error) {
      console.error("Error disconnecting Oura:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect your Oura Ring account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for auth code in URL after Oura auth redirect
  useEffect(() => {
    if (processingAuth) {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get("code");
      
      if (authCode) {
        // Process Oura auth code
        console.log("Processing Oura auth code:", authCode);
        
        // Here you would call an API to exchange the code for tokens
        // For now, we'll simulate success
        setTimeout(() => {
          setConnected(true);
          toast({
            title: "Oura Ring Connected",
            description: "Successfully connected your Oura Ring account.",
          });
          setProcessingAuth(false);
          
          // Clear URL parameters after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      } else {
        setProcessingAuth(false);
      }
    }
  }, [processingAuth, setProcessingAuth]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Oura Ring</CardTitle>
          {connected ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Check className="mr-1 h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
        <CardDescription>
          Connect your Oura Ring to sync sleep and recovery data.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {isLoading || processingAuth ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : connected ? (
          <div className="space-y-4">
            <Alert className="bg-muted/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your Oura Ring is connected and syncing your sleep data.
              </AlertDescription>
            </Alert>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex flex-col space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Last Synced</div>
                  <div className="text-lg font-semibold">Today</div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex flex-col space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Sleep Records</div>
                  <div className="text-lg font-semibold">30</div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex flex-col space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Avg Sleep Score</div>
                  <div className="text-lg font-semibold">85</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Alert className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your Oura Ring to track sleep quality, recovery metrics, and heart rate variability.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        {connected ? (
          <>
            <a
              href="https://cloud.ouraring.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center"
            >
              Open Oura Cloud
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isLoading || processingAuth}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            onClick={handleConnect}
            className="w-full"
            disabled={isLoading || processingAuth}
          >
            Connect Oura Ring
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OuraIntegration;
