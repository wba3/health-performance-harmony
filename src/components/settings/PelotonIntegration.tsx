import React, { useState, useEffect } from "react";
import { Bike, Info, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  connectToPeloton, 
  disconnectPeloton, 
  isPelotonConnected, 
  testPelotonConnection, 
  importPelotonWorkouts 
} from "@/services/pelotonAPI";

const PelotonIntegration: React.FC = () => {
  const { toast } = useToast();
  
  // Peloton connection state - Fix: Initialize with false instead of promise
  const [connected, setConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(localStorage.getItem('peloton_username') || '');
  const [password, setPassword] = useState<string>('');
  const [autoImport, setAutoImport] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [importingData, setImportingData] = useState<boolean>(false);

  // Check connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await isPelotonConnected();
        setConnected(isConnected);
      } catch (err) {
        console.error("Error checking Peloton connection:", err);
      }
    };
    
    checkConnection();
  }, []);

  // Connect to Peloton
  const handleConnect = async () => {
    if (!username) {
      toast({
        title: "Username Required",
        description: "Please enter your Peloton username or email.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter your Peloton password.",
        variant: "destructive",
      });
      return;
    }
    
    setConnecting(true);
    
    try {
      const success = await connectToPeloton(username, password);
      
      if (success) {
        setConnected(true);
        const connectionWorking = await testPelotonConnection();
        
        if (connectionWorking) {
          toast({
            title: "Connected to Peloton",
            description: "Your Peloton account has been successfully connected.",
            variant: "default",
          });
        } else {
          toast({
            title: "Connection Warning",
            description: "Connected to Peloton, but API test failed. You may need to check your credentials.",
            variant: "warning",
          });
        }
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to Peloton. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting to Peloton:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred during the connection process. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
      // Clear password field
      setPassword('');
    }
  };

  // Disconnect from Peloton
  const handleDisconnect = () => {
    disconnectPeloton();
    setConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Peloton account has been disconnected.",
      variant: "default",
    });
  };

  // Import Peloton workouts
  const handleImportWorkouts = async () => {
    if (!connected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Peloton before importing workouts.",
        variant: "destructive",
      });
      return;
    }
    
    setImportingData(true);
    
    try {
      const importCount = await importPelotonWorkouts(30);
      
      toast({
        title: "Workouts Imported",
        description: `Successfully imported ${importCount} Peloton workouts.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Could not import Peloton workouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImportingData(false);
    }
  };

  return (
    <div className="rounded-lg border shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#E74A33] flex items-center justify-center">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium">Peloton</h3>
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground mr-2">Indoor cycling and fitness data</p>
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
              onClick={handleImportWorkouts}
              disabled={importingData}
            >
              {importingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Workouts"
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
            disabled={connecting}
          >
            {connecting ? (
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
              <Label htmlFor="peloton-username">Username or Email</Label>
              <Input 
                id="peloton-username" 
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peloton-password">Password</Label>
              <Input 
                id="peloton-password" 
                type="password" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">Peloton Integration Notes</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc pl-5">
                  <li>This integration uses the unofficial Peloton API</li>
                  <li>Your credentials are only stored locally in your browser</li>
                  <li>We only import basic workout data like duration, distance, and calories</li>
                  <li>If Peloton changes their API, this integration might stop working</li>
                  <li>Please use this feature with consideration for Peloton's terms of service</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="peloton-auto-import"
              checked={autoImport}
              onCheckedChange={setAutoImport}
            />
            <Label htmlFor="peloton-auto-import">Auto-import new workouts</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PelotonIntegration;
