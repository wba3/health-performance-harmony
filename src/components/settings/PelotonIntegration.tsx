
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
import { isPelotonConnected, clearPelotonCredentials, loginToPeloton } from "@/services/pelotonAPI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PelotonIntegration = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      setIsLoading(true);
      try {
        // Fix: await the promise and set the boolean result
        const status = await isPelotonConnected();
        setConnected(status);
      } catch (error) {
        console.error("Error checking Peloton connection:", error);
        setConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionStatus();
  }, []);

  const handleConnect = () => {
    setShowLoginForm(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await loginToPeloton(username, password);
      
      if (success) {
        setConnected(true);
        setShowLoginForm(false);
        toast({
          title: "Peloton Connected",
          description: "Successfully connected your Peloton account.",
        });
      }
    } catch (error) {
      console.error("Error connecting to Peloton:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect your Peloton account. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await clearPelotonCredentials();
      setConnected(false);
      toast({
        title: "Peloton Disconnected",
        description: "Successfully disconnected your Peloton account.",
      });
    } catch (error) {
      console.error("Error disconnecting Peloton:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect your Peloton account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Peloton</CardTitle>
          {connected ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Check className="mr-1 h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
        <CardDescription>
          Connect your Peloton account to sync your workouts and activity data.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : connected ? (
          <div className="space-y-4">
            <Alert className="bg-muted/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your Peloton account is connected and syncing your workout data.
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
                  <div className="text-xs font-medium text-muted-foreground">Workouts</div>
                  <div className="text-lg font-semibold">12</div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex flex-col space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Total Minutes</div>
                  <div className="text-lg font-semibold">356</div>
                </div>
              </div>
            </div>
          </div>
        ) : showLoginForm ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your Peloton username or email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your Peloton password"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading || !username || !password}>
                {isLoading ? "Connecting..." : "Login"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowLoginForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Alert className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your Peloton account to track your rides, workouts, and fitness progress.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        {connected ? (
          <>
            <a
              href="https://members.onepeloton.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center"
            >
              Open Peloton Dashboard
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              Disconnect
            </Button>
          </>
        ) : !showLoginForm ? (
          <Button
            onClick={handleConnect}
            className="w-full"
            disabled={isLoading}
          >
            Connect Peloton
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default PelotonIntegration;
