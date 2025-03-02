
import React from "react";
import DashboardCard from "./DashboardCard";
import { BedDouble, ArrowRight, Moon, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MetricDisplay from "../ui/MetricDisplay";

interface SleepOverviewProps {
  isLoading?: boolean;
}

const SleepOverview: React.FC<SleepOverviewProps> = ({ isLoading = false }) => {
  // Placeholder data for now
  const sleepData = {
    score: 85,
    totalSleep: "7h 32m",
    deepSleep: "1h 45m",
    remSleep: "2h 10m",
    restingHR: 58,
    hrv: 48,
  };

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricDisplay
          label="Sleep Score"
          value={sleepData.score}
          unit="%"
          icon={<Moon className="w-4 h-4" />}
          trend="up"
          trendValue="+5% from yesterday"
          isLoading={isLoading}
          className="col-span-2 md:col-span-1"
        />
        <MetricDisplay
          label="Total Sleep"
          value={sleepData.totalSleep}
          icon={<BedDouble className="w-4 h-4" />}
          isLoading={isLoading}
        />
        <MetricDisplay
          label="Deep Sleep"
          value={sleepData.deepSleep}
          icon={<Moon className="w-4 h-4" />}
          isLoading={isLoading}
        />
        <MetricDisplay
          label="REM Sleep"
          value={sleepData.remSleep}
          icon={<Activity className="w-4 h-4" />}
          isLoading={isLoading}
        />
        <MetricDisplay
          label="Resting HR"
          value={sleepData.restingHR}
          unit="bpm"
          icon={<Heart className="w-4 h-4" />}
          trend="down"
          trendValue="-2 bpm"
          isLoading={isLoading}
        />
      </div>
    </DashboardCard>
  );
};

export default SleepOverview;
