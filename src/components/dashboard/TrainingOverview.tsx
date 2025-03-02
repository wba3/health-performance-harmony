
import React, { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import { ActivitySquare, ArrowRight, Timer, Route, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MetricDisplay from "../ui/MetricDisplay";
import { getLatestTrainingData, TrainingData } from "@/services/database";
import { formatMinutesToHoursAndMinutes } from "@/utils/formatters";

interface TrainingOverviewProps {
  isLoading?: boolean;
}

const TrainingOverview: React.FC<TrainingOverviewProps> = ({ isLoading: initialLoading = false }) => {
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading || true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        const data = await getLatestTrainingData();
        setTrainingData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching training data:', err);
        setError('Failed to load training data');
        setIsLoading(false);
      }
    };

    fetchTrainingData();
  }, []);

  // Fallback data for empty state or loading
  const placeholderData = {
    activity_type: "Cycling",
    duration: 75, // 1h 15m
    distance: 32.5,
    avg_power: 210,
    calories: 620,
  };

  // Use real data if available, otherwise use placeholder
  const displayData = trainingData || placeholderData;

  return (
    <DashboardCard
      title="Training"
      subtitle="Latest workout metrics"
      icon={<ActivitySquare className="w-5 h-5" />}
      isLoading={isLoading}
      headerAction={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/training" className="flex items-center gap-1">
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
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
              <p className="text-xl font-semibold">{displayData.activity_type}</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
              Today
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricDisplay
              label="Duration"
              value={formatMinutesToHoursAndMinutes(displayData.duration)}
              icon={<Timer className="w-4 h-4" />}
              isLoading={isLoading}
            />
            <MetricDisplay
              label="Distance"
              value={displayData.distance}
              unit="km"
              icon={<Route className="w-4 h-4" />}
              isLoading={isLoading}
            />
            <MetricDisplay
              label="Power Output"
              value={displayData.avg_power}
              unit="watts"
              icon={<Zap className="w-4 h-4" />}
              isLoading={isLoading}
            />
            <MetricDisplay
              label="Calories"
              value={displayData.calories}
              unit="kcal"
              icon={<Flame className="w-4 h-4" />}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default TrainingOverview;
