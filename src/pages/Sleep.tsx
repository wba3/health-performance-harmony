
import React from "react";
import PageTransition from "@/components/layout/PageTransition";
import { BedDouble, Calendar, Clock, Moon, Brain, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricDisplay from "@/components/ui/MetricDisplay";

const Sleep: React.FC = () => {
  // Placeholder data
  const sleepData = {
    date: "Today, May 15, 2023",
    score: 85,
    efficiency: 92,
    duration: "7h 32m",
    bedtime: "11:15 PM",
    wakeup: "6:47 AM",
    deep: { hours: 1.75, percentage: 23 },
    rem: { hours: 2.17, percentage: 29 },
    light: { hours: 3.6, percentage: 48 },
    heartRate: { average: 58, min: 54, max: 62 },
    hrv: 48,
    temperature: "+0.2°C",
    respiratoryRate: 14.2,
  };

  const recentNights = [
    { day: "Mon", score: 78 },
    { day: "Tue", score: 80 },
    { day: "Wed", score: 75 },
    { day: "Thu", score: 82 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 84 },
    { day: "Today", score: 85 },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BedDouble className="w-8 h-8" />
                Sleep
              </h1>
              <p className="text-muted-foreground">
                Detailed metrics from your last night's sleep
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>History</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last 7 Days</span>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <DashboardCard
            title="Sleep Score"
            subtitle={sleepData.date}
            icon={<Moon className="w-5 h-5" />}
            className="col-span-1"
          >
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * sleepData.score) / 100}
                    className="text-primary"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{sleepData.score}</span>
                  <span className="text-sm text-muted-foreground">out of 100</span>
                </div>
              </div>
              <div className="flex items-center justify-between w-full mt-8">
                {recentNights.map((night, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="h-24 w-6 bg-muted/30 rounded-full relative">
                      <div
                        className="absolute bottom-0 w-full bg-primary rounded-full"
                        style={{ height: `${night.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs mt-2 font-medium">{night.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Sleep Stages"
            subtitle="Hours spent in each stage"
            icon={<Brain className="w-5 h-5" />}
            className="col-span-1"
          >
            <div className="space-y-6 py-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                    <span className="text-sm font-medium">Deep Sleep</span>
                  </div>
                  <span className="text-sm">
                    {sleepData.deep.hours}h ({sleepData.deep.percentage}%)
                  </span>
                </div>
                <Progress value={sleepData.deep.percentage} className="h-2 bg-muted/30" indicatorClassName="bg-indigo-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-sm font-medium">REM Sleep</span>
                  </div>
                  <span className="text-sm">
                    {sleepData.rem.hours}h ({sleepData.rem.percentage}%)
                  </span>
                </div>
                <Progress value={sleepData.rem.percentage} className="h-2 bg-muted/30" indicatorClassName="bg-purple-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm font-medium">Light Sleep</span>
                  </div>
                  <span className="text-sm">
                    {sleepData.light.hours}h ({sleepData.light.percentage}%)
                  </span>
                </div>
                <Progress value={sleepData.light.percentage} className="h-2 bg-muted/30" indicatorClassName="bg-blue-400" />
              </div>

              <div className="pt-4 flex justify-between items-center text-sm text-muted-foreground border-t">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Bedtime: {sleepData.bedtime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Wakeup: {sleepData.wakeup}</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Biometrics"
            subtitle="Physiological measurements"
            icon={<Heart className="w-5 h-5" />}
            className="col-span-1"
          >
            <div className="grid grid-cols-2 gap-4 py-3">
              <MetricDisplay
                label="Heart Rate"
                value={sleepData.heartRate.average}
                unit="bpm"
                icon={<Heart className="w-4 h-4" />}
                trend="down"
                trendValue="-2 bpm"
              />
              <MetricDisplay
                label="HRV"
                value={sleepData.hrv}
                unit="ms"
                icon={<Activity className="w-4 h-4" />}
                trend="up"
                trendValue="+4 ms"
              />
              <MetricDisplay
                label="Temperature"
                value={sleepData.temperature}
                icon={<Moon className="w-4 h-4" />}
              />
              <MetricDisplay
                label="Respiratory Rate"
                value={sleepData.respiratoryRate}
                unit="br/min"
                icon={<Activity className="w-4 h-4" />}
              />
            </div>
          </DashboardCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default Sleep;
