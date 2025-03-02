
import React from "react";
import { ActivitySquare, Timer, Route, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricDisplay from "@/components/ui/MetricDisplay";
import { TrainingData } from "@/services/database";

interface LatestActivityCardProps {
  latestActivity: TrainingData | null;
  isLoading: boolean;
}

const LatestActivityCard: React.FC<LatestActivityCardProps> = ({
  latestActivity,
  isLoading,
}) => {
  return (
    <DashboardCard
      title="Latest Activity"
      subtitle={latestActivity ? new Date(latestActivity.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "No recent activity"}
      icon={<ActivitySquare className="w-5 h-5" />}
      className="md:col-span-1"
      isLoading={isLoading}
    >
      {latestActivity ? (
        <div className="pt-4 space-y-6">
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-semibold">{latestActivity.activity_type}</h3>
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
              {formatDistanceToNow(new Date(latestActivity.date), { addSuffix: true })}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <MetricDisplay
              label="Duration"
              value={`${Math.floor(latestActivity.duration / 60)}m`}
              icon={<Timer className="w-4 h-4" />}
            />
            <MetricDisplay
              label="Distance"
              value={latestActivity.distance?.toFixed(1) || "0"}
              unit="km"
              icon={<Route className="w-4 h-4" />}
            />
            {latestActivity.avg_heart_rate && (
              <MetricDisplay
                label="Avg Heart Rate"
                value={latestActivity.avg_heart_rate}
                unit="bpm"
                icon={<Heart className="w-4 h-4 text-red-500" />}
                className="col-span-2"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {isLoading ? "Loading activity data..." : "No activity data available"}
        </div>
      )}
    </DashboardCard>
  );
};

export default LatestActivityCard;
