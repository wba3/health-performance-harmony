
import React from "react";
import DashboardCard from "./DashboardCard";
import { Bot, ArrowRight, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AIInsightsProps {
  isLoading?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ isLoading = false }) => {
  // Placeholder insights data
  const insights = [
    {
      id: 1,
      content: "Your sleep score has been consistently high this week, which correlates with improved performance during your morning workouts.",
      type: "performance"
    },
    {
      id: 2,
      content: "Consider increasing your deep sleep by going to bed 30 minutes earlier on days before intense training sessions.",
      type: "recommendation"
    },
    {
      id: 3,
      content: "Your heart rate variability (HRV) dropped significantly after yesterday's high-intensity workout. Consider a recovery day.",
      type: "alert"
    }
  ];

  const getInsightTypeStyles = (type: string) => {
    switch (type) {
      case "performance":
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700";
      case "recommendation":
        return "border-l-4 border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-700";
      case "alert":
        return "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700";
      default:
        return "border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700";
    }
  };

  return (
    <DashboardCard
      title="AI Coach Insights"
      subtitle="Personalized recommendations"
      icon={<Bot className="w-5 h-5" />}
      isLoading={isLoading}
      headerAction={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ai-coach" className="flex items-center gap-1">
            <span>Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      }
      className="col-span-1 md:col-span-2"
    >
      <div className="space-y-4">
        {!isLoading ? (
          <>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-md ${getInsightTypeStyles(insight.type)}`}
                >
                  <p className="text-sm">{insight.content}</p>
                </motion.div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              <span>Get More Insights</span>
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default AIInsights;
