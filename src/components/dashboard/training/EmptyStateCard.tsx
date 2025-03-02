
import React from "react";
import { AlertCircle, ArrowRight, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateCardProps {
  title: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ 
  title, 
  icon, 
  isConnected 
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-zinc-950 text-white">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {icon}
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Training Data Available</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {isConnected 
              ? "Your Strava account is connected, but you need to import your activities from the Settings page."
              : "Connect your Strava account to import your training activities and view performance insights."}
          </p>
          <Link to="/settings">
            <Button className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              {isConnected ? "Import Strava Activities" : "Connect Strava"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
