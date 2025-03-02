
import React from "react";
import { CheckCircle, ExternalLink, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StravaHeaderProps {
  connected: boolean;
  processingAuth: boolean;
  handleConnect: () => void;
  handleDisconnect: () => void;
  importingData: boolean;
  handleImportData: () => void;
}

const StravaHeader: React.FC<StravaHeaderProps> = ({
  connected,
  processingAuth,
  handleConnect,
  handleDisconnect,
  importingData,
  handleImportData,
}) => {
  return (
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
  );
};

export default StravaHeader;
