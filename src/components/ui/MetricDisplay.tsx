
import React from "react";
import { cn } from "@/lib/utils";
import { AreaChart, BadgePlus, BadgeMinus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
  isLoading?: boolean;
  className?: string;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit,
  icon = <AreaChart className="w-4 h-4" />,
  trend,
  trendValue,
  isLoading = false,
  className,
}) => {
  const renderTrendIcon = () => {
    if (trend === "up") return <ArrowUpRight className="w-3 h-3 text-green-500" />;
    if (trend === "down") return <ArrowDownRight className="w-3 h-3 text-red-500" />;
    return null;
  };

  const renderTrendColor = () => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col p-4 rounded-lg border bg-card",
        isLoading && "animate-pulse",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary">{icon}</div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex items-baseline mt-1">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="ml-1 text-sm text-muted-foreground">{unit}</span>}
      </div>
      
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2.5">
          {renderTrendIcon()}
          <span className={cn("text-xs font-medium", renderTrendColor())}>
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default MetricDisplay;
