
import React from "react";
import { useQuery } from "@tanstack/react-query";
import PageTransition from "@/components/layout/PageTransition";
import { getTrainingData } from "@/services/database";
import { isStravaConnected } from "@/services/stravaAPI";
import EmptyStateCard from "@/components/dashboard/training/EmptyStateCard";
import ErrorStateCard from "@/components/dashboard/training/ErrorStateCard";
import { ActivitySquare } from "lucide-react";
import TrainingHeader from "@/components/dashboard/training/TrainingHeader";
import LatestActivityCard from "@/components/dashboard/training/LatestActivityCard";
import PerformanceCard from "@/components/dashboard/training/PerformanceCard";
import WeeklyProgressCard from "@/components/dashboard/training/WeeklyProgressCard";
import CaloriesEffortCard from "@/components/dashboard/training/CaloriesEffortCard";
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

  // Handle empty state (no Strava connection)
  if (!isLoading && !isError && !stravaConnected && (!trainingData || trainingData.length === 0)) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 pt-24 pb-16">
          <TrainingHeader 
            isLoading={isLoading} 
            latestActivity={latestActivity} 
            refetch={refetch}
          />
          <EmptyStateCard 
            title="Training" 
            icon={<ActivitySquare className="w-5 h-5 mr-2" />}
            isConnected={false}
          />
        </div>
      </PageTransition>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 pt-24 pb-16">
          <TrainingHeader 
            isLoading={isLoading} 
            latestActivity={latestActivity}
            refetch={refetch}
          />
          <ErrorStateCard 
            title="Training" 
            icon={<ActivitySquare className="w-5 h-5 mr-2" />} 
            error={error instanceof Error ? error.message : "An unexpected error occurred"}
            onRetry={() => {
              refetch();
              toast({
                title: "Refreshing data",
                description: "Attempting to reload your training data",
              });
            }} 
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <TrainingHeader 
          isLoading={isLoading} 
          latestActivity={latestActivity} 
          refetch={refetch}
        />

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <LatestActivityCard 
            latestActivity={latestActivity}
            isLoading={isLoading}
          />
          
          <PerformanceCard 
            latestActivity={latestActivity}
            isLoading={isLoading}
          />
          
          <WeeklyProgressCard 
            trainingData={trainingData}
            isLoading={isLoading}
          />
        </div>

        <CaloriesEffortCard 
          latestActivity={latestActivity}
          isLoading={isLoading}
        />
      </div>
    </PageTransition>
  );
};

export default Training;
