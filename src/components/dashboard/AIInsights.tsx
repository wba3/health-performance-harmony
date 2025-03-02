
import React, { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import { Bot, ArrowRight, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAIInsights, AIInsight } from "@/services/database";
import { generateInsights, isOpenAIConfigured } from "@/services/openaiAPI";
import { useToast } from "@/components/ui/use-toast";

interface AIInsightsProps {
  isLoading?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ isLoading: initialLoading = false }) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading || true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openAIConfigured, setOpenAIConfigured] = useState<boolean>(false);

  useEffect(() => {
    setOpenAIConfigured(isOpenAIConfigured());
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const data = await getAIInsights(3);
      setInsights(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to load AI insights');
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!openAIConfigured) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please add your OpenAI API key in Settings to generate insights.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const success = await generateInsights();
      if (success) {
        toast({
          title: "Insights Generated",
          description: "New AI insights have been generated based on your data.",
        });
        // Refetch insights
        await fetchInsights();
      } else {
        toast({
          title: "Generation Failed",
          description: "Could not generate new insights. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      toast({
        title: "Error",
        description: "An error occurred while generating insights.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback insights for empty state
  const placeholderInsights = [
    {
      id: "1",
      date: new Date().toISOString(),
      insight_type: "performance",
      content: "Your sleep score has been consistently high this week, which correlates with improved performance during your morning workouts.",
      is_read: false,
      rating: null,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      date: new Date().toISOString(),
      insight_type: "recommendation",
      content: "Consider increasing your deep sleep by going to bed 30 minutes earlier on days before intense training sessions.",
      is_read: false,
      rating: null,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      date: new Date().toISOString(),
      insight_type: "alert",
      content: "Your heart rate variability (HRV) dropped significantly after yesterday's high-intensity workout. Consider a recovery day.",
      is_read: false,
      rating: null,
      created_at: new Date().toISOString()
    }
  ];

  // Use real insights if available, otherwise use placeholders
  const displayInsights = insights.length > 0 ? insights : placeholderInsights;

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
        {error ? (
          <div className="p-4 text-red-500 bg-red-50 rounded-md dark:bg-red-950/30">
            {error}
          </div>
        ) : !isLoading ? (
          <>
            <div className="space-y-4">
              {displayInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-md ${getInsightTypeStyles(insight.insight_type)}`}
                >
                  <p className="text-sm">{insight.content}</p>
                </motion.div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGenerateInsights}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Get More Insights</span>
                </>
              )}
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
