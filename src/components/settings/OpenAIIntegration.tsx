
import React, { useState } from "react";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import OpenAIApiTester from "./OpenAIApiTester";

const OpenAIIntegration: React.FC = () => {
  const { toast } = useToast();
  
  // OpenAI API state
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('openai_api_key') || '');
  const [model, setModel] = useState<string>(localStorage.getItem('openai_model') || 'gpt-4o');
  const [dailyInsights, setDailyInsights] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(!!localStorage.getItem('openai_api_key'));

  // Connect to OpenAI
  const handleConnect = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }
    
    // Store API key in localStorage
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_model', model);
    setConnected(true);
    
    toast({
      title: "Connected to OpenAI",
      description: "Your OpenAI API key has been saved.",
      variant: "default",
    });
  };

  // Disconnect from OpenAI
  const handleDisconnect = () => {
    localStorage.removeItem('openai_api_key');
    setConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Your OpenAI API key has been removed.",
      variant: "default",
    });
  };

  return (
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
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-600"
            onClick={handleDisconnect}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Disconnect
          </Button>
        ) : (
          <Button 
            className="flex items-center gap-2"
            onClick={handleConnect}
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
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openai-model">GPT Model</Label>
            <select
              id="openai-model"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="openai-daily-insights"
              checked={dailyInsights}
              onCheckedChange={setDailyInsights}
            />
            <Label htmlFor="openai-daily-insights">Generate daily insights</Label>
          </div>
        </div>

        {/* Only show API tester when connected */}
        {connected && (
          <>
            <Separator className="my-6" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Test API Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Validate your OpenAI integration by testing connectivity and API functionality.
              </p>
              <OpenAIApiTester />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OpenAIIntegration;
