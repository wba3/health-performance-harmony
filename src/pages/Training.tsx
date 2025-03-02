
import React from "react";
import { useQuery } from "@tanstack/react-query";
import PageTransition from "@/components/layout/PageTransition";
import { 
  ActivitySquare, 
  Calendar, 
  BarChart3, 
  Route, 
  Timer, 
  Flame, 
  ArrowUpRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Zap,
  AlertCircle,
  FileWarning,
  RefreshCcw,
  Heart  // Add the missing Heart icon import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricDisplay from "@/components/ui/MetricDisplay";
import { Progress } from "@/components/ui/progress";
import { getTrainingData, TrainingData } from "@/services/database";
import { isStravaConnected } from "@/services/stravaAPI";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

const Training: React.FC = () => {
  // Fetch training data with React Query
  const { 
    data: trainingData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['training-data'],
    queryFn: async () => {
      // Fetch the last 14 days of training data
      const data = await getTrainingData(14);
      return data;
    }
  });

  // Check if Strava is connected
  const stravaConnected = isStravaConnected();

  // Format latest activity data
  const getLatestActivity = () => {
    if (!trainingData || trainingData.length === 0) return null;
    return trainingData[0];
  };

  const latestActivity = getLatestActivity();

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

  // Prepare data for heart rate zones (placeholder for now)
  // In a real implementation, this would come from the API
  const heartRateZones = [
    { name: "Zone 1", percentage: 15, color: "bg-green-400" },
    { name: "Zone 2", percentage: 35, color: "bg-blue-400" },
    { name: "Zone 3", percentage: 30, color: "bg-yellow-400" },
    { name: "Zone 4", percentage: 15, color: "bg-orange-400" },
    { name: "Zone 5", percentage: 5, color: "bg-red-400" },
  ];

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

  // Handle empty state (no Strava connection)
  if (!isLoading && !isError && !stravaConnected && (!trainingData || trainingData.length === 0)) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 pt-24 pb-16">
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <ActivitySquare className="w-8 h-8" />
                  Training
                </h1>
                <p className="text-muted-foreground">
                  Connect your Strava account to track your training data
                </p>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-4">No Training Data Available</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your Strava account to import your training activities and view performance insights.
            </p>
            <Link to="/settings">
              <Button className="mx-auto flex items-center gap-2">
                Connect Strava
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 pt-24 pb-16">
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <ActivitySquare className="w-8 h-8" />
                  Training
                </h1>
                <p className="text-muted-foreground">
                  Something went wrong while loading your training data
                </p>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileWarning className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">Failed to Load Training Data</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                refetch();
                toast({
                  title: "Refreshing data",
                  description: "Attempting to reload your training data",
                });
              }}
              className="mx-auto flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ActivitySquare className="w-8 h-8" />
                Training
              </h1>
              <p className="text-muted-foreground">
                {isLoading 
                  ? "Loading your training data..." 
                  : latestActivity 
                    ? `Last updated ${formatDistanceToNow(new Date(latestActivity.date), { addSuffix: true })}`
                    : "No recent training data available"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  refetch();
                  toast({
                    title: "Refreshing data",
                    description: "Reloading your latest training data",
                  });
                }}
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <Link to="/settings">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Import</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
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
        </div>

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
      </div>
    </PageTransition>
  );
};

export default Training;
