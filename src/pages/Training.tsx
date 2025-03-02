
import React from "react";
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
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricDisplay from "@/components/ui/MetricDisplay";
import { Progress } from "@/components/ui/progress";

const Training: React.FC = () => {
  // Placeholder data
  const trainingData = {
    date: "Today, May 15, 2023",
    activity: "Cycling",
    duration: "1h 15m",
    distance: 32.5,
    elevation: {
      gain: 450,
      loss: 320,
    },
    calories: 620,
    averagePower: 210,
    normalizedPower: 225,
    maxPower: 532,
    heartRate: {
      average: 142,
      max: 168,
    },
    zones: [
      { name: "Zone 1", percentage: 15, color: "bg-green-400" },
      { name: "Zone 2", percentage: 35, color: "bg-blue-400" },
      { name: "Zone 3", percentage: 30, color: "bg-yellow-400" },
      { name: "Zone 4", percentage: 15, color: "bg-orange-400" },
      { name: "Zone 5", percentage: 5, color: "bg-red-400" },
    ],
    recentActivities: [
      { day: "Mon", type: "Rest", power: 0 },
      { day: "Tue", type: "Cycling", power: 195 },
      { day: "Wed", type: "Run", power: 0 },
      { day: "Thu", type: "Cycling", power: 205 },
      { day: "Fri", type: "Rest", power: 0 },
      { day: "Sat", type: "Cycling", power: 190 },
      { day: "Today", type: "Cycling", power: 210 },
    ],
  };

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
                Detailed metrics from your latest training session
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>History</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <DashboardCard
            title="Latest Activity"
            subtitle={trainingData.date}
            icon={<ActivitySquare className="w-5 h-5" />}
            className="md:col-span-1"
          >
            <div className="pt-4 space-y-6">
              <div className="flex justify-between items-baseline">
                <h3 className="text-2xl font-semibold">{trainingData.activity}</h3>
                <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
                  Today
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MetricDisplay
                  label="Duration"
                  value={trainingData.duration}
                  icon={<Timer className="w-4 h-4" />}
                />
                <MetricDisplay
                  label="Distance"
                  value={trainingData.distance}
                  unit="km"
                  icon={<Route className="w-4 h-4" />}
                />
                <div className="flex gap-2">
                  <MetricDisplay
                    label="Elevation Gain"
                    value={trainingData.elevation.gain}
                    unit="m"
                    icon={<ArrowUpCircle className="w-4 h-4" />}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <MetricDisplay
                    label="Elevation Loss"
                    value={trainingData.elevation.loss}
                    unit="m"
                    icon={<ArrowDownCircle className="w-4 h-4" />}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Performance"
            subtitle="Power and heart rate metrics"
            icon={<Zap className="w-5 h-5" />}
            className="md:col-span-1"
          >
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <MetricDisplay
                  label="Avg Power"
                  value={trainingData.averagePower}
                  unit="W"
                  icon={<Zap className="w-4 h-4" />}
                  trend="up"
                  trendValue={`+${trainingData.averagePower - trainingData.recentActivities[5].power} W`}
                />
                <MetricDisplay
                  label="Norm Power"
                  value={trainingData.normalizedPower}
                  unit="W"
                  icon={<Zap className="w-4 h-4" />}
                />
                <MetricDisplay
                  label="Max Power"
                  value={trainingData.maxPower}
                  unit="W"
                  icon={<ArrowUpRight className="w-4 h-4" />}
                  className="col-span-2"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Heart Rate</span>
                  <div className="text-sm">
                    <span className="font-medium">{trainingData.heartRate.average}</span>
                    <span className="text-muted-foreground"> / {trainingData.heartRate.max} bpm</span>
                  </div>
                </div>
                <div className="h-6 w-full rounded-md bg-muted/30 overflow-hidden flex">
                  {trainingData.zones.map((zone, index) => (
                    <div
                      key={index}
                      className={`h-full ${zone.color}`}
                      style={{ width: `${zone.percentage}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1 pt-1">
                  {trainingData.zones.map((zone, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <span>{zone.name}</span>
                      <span>{zone.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Weekly Progress"
            subtitle="Activity and power output"
            icon={<BarChart3 className="w-5 h-5" />}
            className="md:col-span-1"
          >
            <div className="py-4">
              <div className="flex items-center justify-between w-full mb-4">
                {trainingData.recentActivities.map((activity, index) => (
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
                      <span className="text-xl font-semibold">156.4</span>
                      <span className="text-sm text-muted-foreground">km</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-xs text-muted-foreground">Calories Burned</span>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-xl font-semibold">2,845</span>
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
        >
          <div className="py-4 grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Total Calories</h3>
                <span className="text-2xl font-semibold">{trainingData.calories}</span>
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
        </DashboardCard>
      </div>
    </PageTransition>
  );
};

export default Training;
