
import React from "react";
import DashboardCard from "./DashboardCard";
import { ActivitySquare, ArrowRight, Timer, Route, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MetricDisplay from "../ui/MetricDisplay";

interface TrainingOverviewProps {
  isLoading?: boolean;
}

const TrainingOverview: React.FC<TrainingOverviewProps> = ({ isLoading = false }) => {
  // Placeholder data for now
  const trainingData = {
    recentActivity: "Cycling",
    duration: "1h 15m",
    distance: "32.5",
    powerOutput: "210",
    calories: "620",
  };

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
            <p className="text-xl font-semibold">{trainingData.recentActivity}</p>
          </div>
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
            Today
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricDisplay
            label="Duration"
            value={trainingData.duration}
            icon={<Timer className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <MetricDisplay
            label="Distance"
            value={trainingData.distance}
            unit="km"
            icon={<Route className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <MetricDisplay
            label="Power Output"
            value={trainingData.powerOutput}
            unit="watts"
            icon={<Zap className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <MetricDisplay
            label="Calories"
            value={trainingData.calories}
            unit="kcal"
            icon={<Flame className="w-4 h-4" />}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardCard>
  );
};

export default TrainingOverview;
