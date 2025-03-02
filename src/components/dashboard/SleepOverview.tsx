
import React, { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import { BedDouble, ArrowRight, Moon, Activity, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MetricDisplay from "../ui/MetricDisplay";
import { getSleepData, SleepData } from "@/services/database";
import { formatMinutesToHoursAndMinutes } from "@/utils/formatters";
import { isOuraConnected } from "@/services/ouraAPI";

interface SleepOverviewProps {
  isLoading?: boolean;
}

const SleepOverview: React.FC<SleepOverviewProps> = ({ isLoading: initialLoading = false }) => {
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading || true);
  const [error, setError] = useState<string | null>(null);
  const [ouraConnected, setOuraConnected] = useState<boolean>(false);

  useEffect(() => {
    // Check if Oura is connected
    setOuraConnected(isOuraConnected());
    
    const fetchSleepData = async () => {
      try {
        // Get the most recent sleep data entry (limit to 1)
        const data = await getSleepData(1);
        setSleepData(data.length > 0 ? data[0] : null);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching sleep data:', err);
        setError('Failed to load sleep data');
        setIsLoading(false);
      }
    };

    fetchSleepData();
  }, []);

  // Fallback data for empty state or loading
  const placeholderData = {
    sleep_score: 85,
    total_sleep: 452, // 7h 32m
    deep_sleep: 105, // 1h 45m
    rem_sleep: 130, // 2h 10m
    resting_hr: 58,
    hrv: 48,
  };

  // Use real data if available, otherwise use placeholder
  const displayData = sleepData || placeholderData;

  return (
    <DashboardCard
      title="Sleep"
      subtitle="Last night's sleep metrics"
      icon={<BedDouble className="w-5 h-5" />}
      isLoading={isLoading}
      headerAction={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sleep" className="flex items-center gap-1">
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      }
      className="col-span-1 md:col-span-2"
    >
      {error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      ) : !sleepData && !isLoading ? (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">No sleep data available</p>
            <p className="text-sm mt-1">
              {ouraConnected ? (
                "Import your Oura Ring sleep data from the Settings page."
              ) : (
                "Connect your Oura Ring in Settings to import sleep data."
              )}
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/settings">Go to Settings</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricDisplay
            label="Sleep Score"
            value={displayData.sleep_score}
            unit="%"
            icon={<Moon className="w-4 h-4" />}
            trend="up"
            trendValue="+5% from yesterday"
            isLoading={isLoading}
            className="col-span-2 md:col-span-1"
          />
          <MetricDisplay
            label="Total Sleep"
            value={formatMinutesToHoursAndMinutes(displayData.total_sleep)}
            icon={<BedDouble className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <MetricDisplay
            label="Deep Sleep"
            value={formatMinutesToHoursAndMinutes(displayData.deep_sleep)}
            icon={<Moon className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <MetricDisplay
            label="REM Sleep"
            value={formatMinutesToHoursAndMinutes(displayData.rem_sleep)}
            icon={<Activity className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <MetricDisplay
            label="Resting HR"
            value={displayData.resting_hr}
            unit="bpm"
            icon={<Heart className="w-4 h-4" />}
            trend="down"
            trendValue="-2 bpm"
            isLoading={isLoading}
          />
        </div>
      )}
    </DashboardCard>
  );
};

export default SleepOverview;
