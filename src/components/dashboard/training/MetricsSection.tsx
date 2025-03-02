
import React from "react";
import { Heart, Timer, Flame, Dumbbell } from "lucide-react";
import MetricDisplay from "@/components/ui/MetricDisplay";

interface MetricsSectionProps {
  activity: {
    date: string;
    activity_type?: string;
    duration: number;
    avg_heart_rate?: number;
    calories?: number;
  };
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ activity }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricDisplay
        icon={<Dumbbell className="h-5 w-5 text-zinc-950" />}
        value={activity.activity_type || "Unknown"}
        label="Activity Type"
        trend={null}
      />
      <MetricDisplay
        icon={<Timer className="h-5 w-5 text-zinc-950" />}
        value={`${Math.floor(activity.duration / 60)}m`}
        label="Duration"
        trend={null}
      />
      <MetricDisplay
        icon={<Heart className="h-5 w-5 text-red-500" />}
        value={activity.avg_heart_rate ? `${activity.avg_heart_rate} bpm` : "N/A"}
        label="Avg HR"
        trend={null}
      />
      <MetricDisplay
        icon={<Flame className="h-5 w-5 text-orange-500" />}
        value={activity.calories ? `${activity.calories} kcal` : "N/A"}
        label="Calories"
        trend={null}
      />
    </div>
  );
};

export default MetricsSection;
