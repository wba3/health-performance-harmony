import React, { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import { BedDouble, ArrowRight, Moon, Activity, Heart, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MetricDisplay from "../ui/MetricDisplay";
import { getSleepData, SleepData } from "@/services/database";
import { formatMinutesToHoursAndMinutes } from "@/utils/formatters";
import { isOuraConnected } from "@/services/ouraAPI";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatDistance } from "date-fns";

interface SleepOverviewProps {
  isLoading?: boolean;
}

const SleepOverview: React.FC<SleepOverviewProps> = ({ isLoading: initialLoading = false }) => {
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [recentSleepData, setRecentSleepData] = useState<SleepData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading || true);
  const [error, setError] = useState<string | null>(null);
  const [ouraConnected, setOuraConnected] = useState<boolean>(false);

  useEffect(() => {
    setOuraConnected(isOuraConnected());
    
    const fetchSleepData = async () => {
      try {
        const data = await getSleepData(7);
        
        if (data.length > 0) {
          setSleepData(data[0]);
          setRecentSleepData(data.reverse());
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching sleep data:', err);
        setError('Failed to load sleep data');
        setIsLoading(false);
      }
    };

    fetchSleepData();
  }, []);

  const chartData = recentSleepData.map(item => ({
    date: item.date,
    score: item.sleep_score,
    total: Math.round((item.total_sleep / 60) * 10) / 10,
    deep: Math.round((item.deep_sleep / 60) * 10) / 10,
    rem: Math.round((item.rem_sleep / 60) * 10) / 10,
  }));

  const calculateScoreTrend = () => {
    if (recentSleepData.length < 2) return null;
    
    const current = recentSleepData[recentSleepData.length - 1].sleep_score;
    const previous = recentSleepData[recentSleepData.length - 2].sleep_score;
    
    const diff = current - previous;
    if (diff === 0) return null;
    
    return {
      direction: diff > 0 ? "up" as const : "down" as const,
      value: `${Math.abs(diff)}% from yesterday`
    };
  };

  const scoreTrend = calculateScoreTrend();

  const placeholderData = {
    sleep_score: 85,
    total_sleep: 452,
    deep_sleep: 105,
    rem_sleep: 130,
    resting_hr: 58,
    hrv: 48,
  };

  const displayData = sleepData || placeholderData;

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
      {error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      ) : !sleepData && !isLoading ? (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">No sleep data available</p>
            <p className="text-sm mt-1">
              {ouraConnected ? (
                "Import your Oura Ring sleep data from the Settings page."
              ) : (
                "Connect your Oura Ring in Settings to import sleep data."
              )}
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/settings">Go to Settings</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricDisplay
              label="Sleep Score"
              value={displayData.sleep_score}
              unit="%"
              icon={<Moon className="w-4 h-4" />}
              trend={scoreTrend?.direction}
              trendValue={scoreTrend?.value}
              isLoading={isLoading}
              className="col-span-2 md:col-span-1"
            />
            <MetricDisplay
              label="Total Sleep"
              value={formatMinutesToHoursAndMinutes(displayData.total_sleep)}
              icon={<BedDouble className="w-4 h-4" />}
              isLoading={isLoading}
            />
            <MetricDisplay
              label="Deep Sleep"
              value={formatMinutesToHoursAndMinutes(displayData.deep_sleep)}
              icon={<Moon className="w-4 h-4" />}
              isLoading={isLoading}
            />
            <MetricDisplay
              label="REM Sleep"
              value={formatMinutesToHoursAndMinutes(displayData.rem_sleep)}
              icon={<Activity className="w-4 h-4" />}
              isLoading={isLoading}
            />
            <MetricDisplay
              label="Resting HR"
              value={displayData.resting_hr}
              unit="bpm"
              icon={<Heart className="w-4 h-4" />}
              isLoading={isLoading}
            />
          </div>

          {chartData.length > 1 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Recent Sleep Trends</span>
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>Score</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Hours</span>
                  </div>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(192, 132, 252)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(192, 132, 252)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(96, 165, 250)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(96, 165, 250)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        const today = new Date();
                        if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) return 'Today';
                        return formatDistance(date, today, { addSuffix: true });
                      }}
                    />
                    <YAxis yAxisId="left" domain={[0, 100]} hide />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 12]} tickCount={5} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'score') return [`${value}%`, 'Sleep Score'];
                        return [`${value}h`, 'Sleep Duration'];
                      }}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="rgb(192, 132, 252)" 
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      yAxisId="left"
                      name="score"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="rgb(96, 165, 250)" 
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      yAxisId="right"
                      name="total"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};

export default SleepOverview;
