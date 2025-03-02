
import React from "react";
import PageTransition from "@/components/layout/PageTransition";
import SleepOverview from "@/components/dashboard/SleepOverview";
import TrainingOverview from "@/components/dashboard/TrainingOverview";
import AIInsights from "@/components/dashboard/AIInsights";
import { Button } from "@/components/ui/button";
import { LineChart, ActivitySquare, BedDouble, Bot } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <section className="mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Your health and performance metrics at a glance
            </p>
          </div>
        </section>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <SleepOverview />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <TrainingOverview />
          </div>
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <AIInsights />
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 space-y-6">
            <h3 className="text-lg font-medium">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/10"
                asChild
              >
                <Link to="/sleep">
                  <BedDouble className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Sleep History</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/10"
                asChild
              >
                <Link to="/training">
                  <ActivitySquare className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Training Log</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/10"
                asChild
              >
                <Link to="/ai-coach">
                  <Bot className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">AI Coach</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
