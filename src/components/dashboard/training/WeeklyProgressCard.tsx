
import React from "react";
import { BarChart3 } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { TrainingData } from "@/services/database/trainingService";

interface WeeklyProgressCardProps {
  trainingData: TrainingData[] | undefined;
  isLoading: boolean;
}

const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
  trainingData,
  isLoading,
}) => {
  // Calculate weekly metrics
  const calculateWeeklyMetrics = () => {
    if (!trainingData || trainingData.length === 0) return { totalDistance: 0, totalCalories: 0 };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyData = trainingData.filter(activity => 
      new Date(activity.date) >= oneWeekAgo
    );

    const totalDistance = weeklyData.reduce(
      (sum, activity) => sum + (activity.distance || 0), 
      0
    );
    
    const totalCalories = weeklyData.reduce(
      (sum, activity) => sum + (activity.calories || 0), 
      0
    );

    return { totalDistance, totalCalories };
  };

  const weeklyMetrics = calculateWeeklyMetrics();

  // Format data for weekly chart
  const formatChartData = () => {
    if (!trainingData || trainingData.length === 0) {
      return Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          type: "Rest",
          power: 0,
          date: date.toISOString().split('T')[0]
        };
      });
    }

    // Create an array for the last 7 days
    const last7Days = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      // Find activity for this day
      const activity = trainingData.find(a => a.date === dateStr);
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        type: activity ? activity.activity_type : "Rest",
        power: activity?.avg_power || 0,
        date: dateStr
      };
    });

    return last7Days;
  };

  const chartData = formatChartData();

  return (
    <DashboardCard
      title="Weekly Progress"
      subtitle="Activity and power output"
      icon={<BarChart3 className="w-5 h-5" />}
      className="md:col-span-1"
      isLoading={isLoading}
    >
      <div className="py-4">
        <div className="flex items-center justify-between w-full mb-4">
          {chartData.map((activity, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-32 w-9 bg-muted/30 rounded-md relative overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full ${
                    activity.power > 0 ? "bg-primary" : "bg-muted/10"
                  } rounded-b-md`}
                  style={{
                    height: `${activity.power > 0 ? (activity.power / 250) * 100 : 10}%`,
                  }}
                ></div>
              </div>
              <span className="text-xs mt-2 font-medium">{activity.day}</span>
              <span className="text-[10px] text-muted-foreground">{activity.type}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Total This Week</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold">{weeklyMetrics.totalDistance.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">km</span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-xs text-muted-foreground">Calories Burned</span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-xl font-semibold">{weeklyMetrics.totalCalories}</span>
                <span className="text-sm text-muted-foreground">kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default WeeklyProgressCard;
