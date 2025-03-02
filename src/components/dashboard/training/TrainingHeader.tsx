
import React from "react";
import { ActivitySquare, Calendar, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { TrainingData } from "@/services/database";

interface TrainingHeaderProps {
  isLoading: boolean;
  latestActivity: TrainingData | null;
  refetch: () => void;
}

const TrainingHeader: React.FC<TrainingHeaderProps> = ({
  isLoading,
  latestActivity,
  refetch,
}) => {
  return (
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
  );
};

export default TrainingHeader;
