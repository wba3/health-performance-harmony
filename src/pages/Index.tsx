
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ActivitySquare, BedDouble, Bot, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Health & Performance Tracker
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                    Track your sleep, workouts, and get AI-powered insights to optimize your
                    performance and recovery.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col gap-2 min-[400px]:flex-row mt-4"
                >
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => navigate("/dashboard")}
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mx-auto flex w-full items-center justify-center lg:justify-end"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
                  <div className="relative overflow-hidden rounded-xl border bg-background p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <BedDouble className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Sleep Tracking</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Monitor your sleep quality, stages, and recovery metrics.
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border bg-background p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <ActivitySquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Training Data</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track your workouts, power output, and fitness progress.
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border bg-background p-6 sm:col-span-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">AI Coach</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Get personalized insights and recommendations powered by AI to optimize your
                      performance and recovery.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
