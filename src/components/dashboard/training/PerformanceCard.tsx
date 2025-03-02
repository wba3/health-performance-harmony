
import React from "react";
import { Zap, ArrowUpRight } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricDisplay from "@/components/ui/MetricDisplay";
import { TrainingData } from "@/services/database/trainingService";

interface PerformanceCardProps {
  latestActivity: TrainingData | null;
  isLoading: boolean;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  latestActivity,
  isLoading,
}) => {
  // Prepare data for heart rate zones (placeholder for now)
  // In a real implementation, this would come from the API
  const heartRateZones = [
    { name: "Zone 1", percentage: 15, color: "bg-green-400" },
    { name: "Zone 2", percentage: 35, color: "bg-blue-400" },
    { name: "Zone 3", percentage: 30, color: "bg-yellow-400" },
    { name: "Zone 4", percentage: 15, color: "bg-orange-400" },
    { name: "Zone 5", percentage: 5, color: "bg-red-400" },
  ];

  return (
    <DashboardCard
      title="Performance"
      subtitle="Power and heart rate metrics"
      icon={<Zap className="w-5 h-5" />}
      className="md:col-span-1"
      isLoading={isLoading}
    >
      {latestActivity ? (
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {latestActivity.avg_power && (
              <MetricDisplay
                label="Avg Power"
                value={latestActivity.avg_power}
                unit="W"
                icon={<Zap className="w-4 h-4" />}
                trend={latestActivity.avg_power > 200 ? "up" as const : "down" as const}
                trendValue={`${Math.abs(latestActivity.avg_power - 200)} W`}
              />
            )}
            
            {latestActivity.max_power && (
              <MetricDisplay
                label="Max Power"
                value={latestActivity.max_power}
                unit="W"
                icon={<ArrowUpRight className="w-4 h-4" />}
              />
            )}
            
            {!latestActivity.avg_power && !latestActivity.max_power && (
              <div className="col-span-2 text-center py-4 text-muted-foreground">
                No power data available
              </div>
            )}
          </div>

          {latestActivity.avg_heart_rate && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Heart Rate Zones</span>
                <div className="text-sm">
                  <span className="font-medium">{latestActivity.avg_heart_rate}</span>
                  <span className="text-muted-foreground"> / {latestActivity.max_heart_rate || '—'} bpm</span>
                </div>
              </div>
              <div className="h-6 w-full rounded-md bg-muted/30 overflow-hidden flex">
                {heartRateZones.map((zone, index) => (
                  <div
                    key={index}
                    className={`h-full ${zone.color}`}
                    style={{ width: `${zone.percentage}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1 pt-1">
                {heartRateZones.map((zone, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span>{zone.name}</span>
                    <span>{zone.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {isLoading ? "Loading performance data..." : "No performance data available"}
        </div>
      )}
    </DashboardCard>
  );
};

export default PerformanceCard;
