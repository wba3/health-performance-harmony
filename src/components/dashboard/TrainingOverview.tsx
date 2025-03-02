
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  Dumbbell, 
  Flame, 
  Heart, 
  Timer, 
  Zap, 
  Link as LinkIcon,
  FileWarning
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { isStravaConnected } from "@/services/stravaAPI";

const TrainingOverview = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [stravaConnected, setStravaConnected] = useState<boolean>(false);
  
  // Load training data
  useEffect(() => {
    const fetchTrainingData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check Strava connection status
        setStravaConnected(isStravaConnected());
        
        // Get last 7 days of training data
        const { data, error } = await supabase
          .from("training_data")
          .select("*")
          .order("date", { ascending: false })
          .limit(7);
          
        if (error) throw error;
        
        setTrainingData(data || []);
      } catch (err) {
        console.error("Error fetching training data:", err);
        setError("Failed to load training data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrainingData();
  }, []);
  
  // Format data for chart
  const chartData = trainingData
    .slice()
    .reverse()
    .map(activity => ({
      date: new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: activity.calories || 0,
    }));
  
  // Get latest activity
  const latestActivity = trainingData[0] || null;

  // No connection yet
  if (!isLoading && !error && !stravaConnected && trainingData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-zinc-950 text-white">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5" />
              Training Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Training Data Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Connect your Strava account to import your training activities and view performance insights.
            </p>
            <Link to="/settings">
              <Button className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Connect Strava
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show error state
  if (!isLoading && error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-zinc-950 text-white">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5" />
              Training Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileWarning className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Training Data</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show connected but no data
  if (!isLoading && !error && stravaConnected && trainingData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-zinc-950 text-white">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5" />
              Training Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Training Data Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your Strava account is connected, but you need to import your activities from the Settings page.
            </p>
            <Link to="/settings">
              <Button className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Import Strava Activities
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-zinc-950 text-white">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Dumbbell className="mr-2 h-5 w-5" />
            Training Overview
          </span>
          <Link to="/training">
            <Button variant="link" className="text-white p-0 h-auto">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      {isLoading ? (
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-6">
          {latestActivity && (
            <>
              <div className="flex items-center mb-4">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Latest Activity: {new Date(latestActivity.date).toLocaleDateString()}
                </span>
              </div>
            
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricDisplay
                  icon={<Dumbbell className="h-5 w-5 text-zinc-950" />}
                  value={latestActivity.activity_type || "Unknown"}
                  label="Activity Type"
                  trend={null}
                />
                <MetricDisplay
                  icon={<Timer className="h-5 w-5 text-zinc-950" />}
                  value={`${Math.floor(latestActivity.duration / 60)}m`}
                  label="Duration"
                  trend={null}
                />
                <MetricDisplay
                  icon={<Heart className="h-5 w-5 text-red-500" />}
                  value={latestActivity.avg_heart_rate ? `${latestActivity.avg_heart_rate} bpm` : "N/A"}
                  label="Avg HR"
                  trend={null}
                />
                <MetricDisplay
                  icon={<Flame className="h-5 w-5 text-orange-500" />}
                  value={latestActivity.calories ? `${latestActivity.calories} kcal` : "N/A"}
                  label="Calories"
                  trend={null}
                />
              </div>
            </>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Weekly Calories Burned</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#FC4C02" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TrainingOverview;
