
import React from "react";
import { FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateCardProps {
  title: string;
  icon: React.ReactNode;
  error: string | null;
  onRetry: () => void;
}

const ErrorStateCard: React.FC<ErrorStateCardProps> = ({
  title,
  icon,
  error,
  onRetry
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
          <FileWarning className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to Load Training Data</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorStateCard;
