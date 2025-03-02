
import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/layout/PageTransition";
import { ArrowRight, Activity, Moon, Dumbbell, BrainCircuit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center bg-background text-center py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center gap-8 mb-8">
            <Activity className="h-10 w-10 text-blue-500" />
            <Moon className="h-10 w-10 text-[#3b82f6]" />
            <Dumbbell className="h-10 w-10 text-orange-500" />
            <BrainCircuit className="h-10 w-10 text-green-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Health & Performance Tracker
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Track your sleep, training, and get AI-powered coaching insights to optimize your performance.
          </p>
          
          <Link to="/login">
            <Button size="lg" className="px-8 mb-16">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          <div className="text-muted-foreground text-sm">
            <p>To get started, you'll need to:</p>
            <ol className="list-decimal text-left max-w-md mx-auto mt-4 space-y-2">
              <li>Create an account or sign in</li>
              <li>Connect your Oura Ring account</li>
              <li>Connect your Strava account</li>
              <li>Add your OpenAI API key for AI coaching</li>
            </ol>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LandingPage;
