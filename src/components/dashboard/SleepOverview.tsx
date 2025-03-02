import React, { useState, useEffect } from 'react';
import { isOuraConnected } from '@/services/ouraAPI';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SleepOverview = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [ouraConnected, setOuraConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSleepData = async () => {
      setIsLoading(true);
      
      try {
        // Check Oura API connection status - Fix: Handle promise properly
        const checkOuraConnection = async () => {
          try {
            const isConnected = await isOuraConnected();
            setOuraConnected(isConnected);
          } catch (err) {
            console.error("Error checking Oura connection:", err);
            setOuraConnected(false);
          }
        };
        
        await checkOuraConnection();
        
        // Simulate fetching sleep data (replace with actual data fetching)
        setTimeout(() => {
          const mockSleepData = [
            { date: '2024-01-20', score: 85, hours: 7.5 },
            { date: '2024-01-19', score: 78, hours: 6.8 },
            { date: '2024-01-18', score: 92, hours: 8.2 },
          ];
          setSleepData(mockSleepData);
          setIsLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Error fetching sleep data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSleepData();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-zinc-950 text-white">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Moon className="mr-2 h-5 w-5" />
            Sleep Overview
          </span>
          <Link to="/sleep">
            <Button variant="link" className="text-white p-0 h-auto">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div>
            {sleepData.length > 0 ? (
              sleepData.map((item, index) => (
                <div key={index} className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                  <p>Score: {item.score}</p>
                  <p>Hours: {item.hours}</p>
                </div>
              ))
            ) : (
              <p>No sleep data available.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SleepOverview;
