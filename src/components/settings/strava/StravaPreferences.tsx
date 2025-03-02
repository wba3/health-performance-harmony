
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StravaPreferencesProps {
  autoImport: boolean;
  setAutoImport: (value: boolean) => void;
  powerData: boolean;
  setPowerData: (value: boolean) => void;
}

const StravaPreferences: React.FC<StravaPreferencesProps> = ({
  autoImport,
  setAutoImport,
  powerData,
  setPowerData,
}) => {
  return (
    <div className="space-y-4">
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
  );
};

export default StravaPreferences;
