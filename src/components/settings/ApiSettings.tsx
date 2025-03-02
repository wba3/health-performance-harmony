import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Key } from "lucide-react";
import OuraIntegration from "./OuraIntegration";
import { StravaIntegration } from "./StravaIntegration";
import PelotonIntegration from "./PelotonIntegration";
import OpenAIIntegration from "./OpenAIIntegration";

const ApiSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [processingOuraAuth, setProcessingOuraAuth] = useState<boolean>(false);
  const [processingStravaAuth, setProcessingStravaAuth] = useState<boolean>(false);

  // Handle OAuth callbacks
  React.useEffect(() => {
    // Process OAuth callback if code is present
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // Check if it's a Strava callback (Strava uses state parameter)
      if (localStorage.getItem('strava_auth_state') === state) {
        // Call the StravaIntegration's OAuth callback handler
        // This is just to reset processing state since actual handling is in component
        setProcessingStravaAuth(true);
      } 
      // Otherwise assume it's an Oura callback
      else if (localStorage.getItem('ouraClientId')) {
        // Call the OuraIntegration's OAuth callback handler
        // This is just to reset processing state since actual handling is in component
        setProcessingOuraAuth(true);
      }
    }
  }, [searchParams]);

  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          API Connections
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Connect your sleep and training services to enable health and performance tracking
        </p>
      </div>
      
      <div className="space-y-8">
        <OuraIntegration 
          processingAuth={processingOuraAuth} 
          setProcessingAuth={setProcessingOuraAuth} 
        />
        <StravaIntegration 
          processingAuth={processingStravaAuth} 
          setProcessingAuth={setProcessingStravaAuth} 
        />
        <PelotonIntegration />
        <OpenAIIntegration />
      </div>
    </div>
  );
};

export default ApiSettings;
