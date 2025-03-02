
import React from "react";
import { Flame } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Progress } from "@/components/ui/progress";
import { TrainingData } from "@/services/database";

interface CaloriesEffortCardProps {
  latestActivity: TrainingData | null;
  isLoading: boolean;
}

const CaloriesEffortCard: React.FC<CaloriesEffortCardProps> = ({
  latestActivity,
  isLoading,
}) => {
  return (
    <DashboardCard
      title="Calories & Effort"
      subtitle="Energy expenditure details"
      icon={<Flame className="w-5 h-5" />}
      className="mb-8"
      isLoading={isLoading}
    >
      {latestActivity && latestActivity.calories ? (
        <div className="py-4 grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Total Calories</h3>
              <span className="text-2xl font-semibold">{latestActivity.calories}</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-sm text-muted-foreground">
              75% of your daily active calorie goal
            </p>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-medium mb-3">Intensity</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Moderate</span>
                  <span>65%</span>
                </div>
                <div className="flex justify-between">
                  <span>Vigorous</span>
                  <span>35%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Training Load</h3>
            <div className="relative w-full h-5 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary"
                style={{ width: "65%" }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Recovery</span>
              <span className="font-medium">Optimal</span>
              <span>Overtraining</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {isLoading ? "Loading effort data..." : "No calorie or effort data available"}
        </div>
      )}
    </DashboardCard>
  );
};

export default CaloriesEffortCard;
