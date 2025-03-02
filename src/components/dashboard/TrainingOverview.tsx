
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  ArrowRight, 
  Dumbbell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isStravaConnected } from "@/services/stravaAPI";

// Import the smaller components
import EmptyStateCard from "./training/EmptyStateCard";
import ErrorStateCard from "./training/ErrorStateCard";
import MetricsSection from "./training/MetricsSection";
import ActivityChart from "./training/ActivityChart";

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
      <EmptyStateCard 
        title="Training Overview" 
        icon={<Dumbbell className="mr-2 h-5 w-5" />} 
        isConnected={false} 
      />
    );
  }
  
  // Show error state
  if (!isLoading && error) {
    return (
      <ErrorStateCard 
        title="Training Overview" 
        icon={<Dumbbell className="mr-2 h-5 w-5" />} 
        error={error}
        onRetry={() => window.location.reload()} 
      />
    );
  }
  
  // Show connected but no data
  if (!isLoading && !error && stravaConnected && trainingData.length === 0) {
    return (
      <EmptyStateCard 
        title="Training Overview" 
        icon={<Dumbbell className="mr-2 h-5 w-5" />} 
        isConnected={true} 
      />
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
            
              <MetricsSection activity={latestActivity} />
            </>
          )}
          
          <ActivityChart 
            data={chartData} 
            dataKey="calories" 
            title="Weekly Calories Burned" 
            color="#FC4C02"
            unit="kcal"
          />
        </CardContent>
      )}
    </Card>
  );
};

export default TrainingOverview;
