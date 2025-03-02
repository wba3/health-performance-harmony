
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/layout/PageTransition";
import { MoveRight, Activity, Moon, Dumbbell, BrainCircuit } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 flex justify-center gap-3">
            <Activity className="h-12 w-12 text-primary" />
            <Moon className="h-12 w-12 text-blue-400" />
            <Dumbbell className="h-12 w-12 text-orange-500" />
            <BrainCircuit className="h-12 w-12 text-green-500" />
          </div>
          
          <h1 className="text-5xl font-bold tracking-tighter mb-4">
            Health & Performance Tracker
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Track your sleep, training, and get AI-powered coaching insights to optimize your performance.
          </p>
          
          <div className="space-y-4">
            <Link to="/dashboard">
              <Button size="lg" className="px-8">
                Go to Dashboard <MoveRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <div className="text-muted-foreground text-sm">
              <p className="mt-8">To get started, you'll need to:</p>
              <ol className="list-decimal list-inside mt-2 text-left">
                <li>Go to the <Link to="/settings" className="text-primary underline">Settings page</Link> to add your API keys</li>
                <li>Connect your Oura Ring account</li>
                <li>Connect your Strava account</li>
                <li>Add your OpenAI API key for AI coaching</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LandingPage;
