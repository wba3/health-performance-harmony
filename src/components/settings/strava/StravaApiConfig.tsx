
import React from "react";
import { Info, Link } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface StravaApiConfigProps {
  clientId: string;
  setClientId: (value: string) => void;
  clientSecret: string;
  setClientSecret: (value: string) => void;
  stravaDomain: string;
  appDomain: string;
}

const StravaApiConfig: React.FC<StravaApiConfigProps> = ({
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  stravaDomain,
  appDomain,
}) => {
  return (
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
    </div>
  );
};

export default StravaApiConfig;
