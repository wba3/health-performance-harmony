
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Timer, 
  Route as RouteIcon, 
  Heart, 
  Map, 
  Zap, 
  BarChart, 
  Activity,
  Flame
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingData } from "@/services/database";
import { formatDate, formatMinutesToHoursAndMinutes, formatWithUnit } from "@/utils/formatters";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricsSection from "@/components/dashboard/training/MetricsSection";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "@/components/ui/use-toast";

const TrainingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch the specific training activity data
  const { data: activity, isLoading, isError, error } = useQuery({
    queryKey: ['training-activity', id],
    queryFn: async () => {
      if (!id) throw new Error("Activity ID is required");
      
      const { data, error } = await supabase
        .from("training_data")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error("Activity not found");
      
      return data as TrainingData;
    }
  });

  // Handle back button click
  const handleBack = () => {
    navigate("/training");
  };

  // Sample heart rate data for visualization (in a real app, this would come from the API)
  const heartRateData = [
    { minute: 0, value: 90 },
    { minute: 5, value: 120 },
    { minute: 10, value: 140 },
    { minute: 15, value: 155 },
    { minute: 20, value: 165 },
    { minute: 25, value: 160 },
    { minute: 30, value: 150 },
    { minute: 35, value: 145 },
    { minute: 40, value: 135 },
    { minute: 45, value: 125 },
    { minute: 50, value: 115 },
    { minute: 55, value: 100 },
    { minute: 60, value: 95 },
  ];

  // Sample power data (in a real app, this would come from the API)
  const powerData = [
    { minute: 0, value: 150 },
    { minute: 5, value: 200 },
    { minute: 10, value: 250 },
    { minute: 15, value: 280 },
    { minute: 20, value: 300 },
    { minute: 25, value: 290 },
    { minute: 30, value: 270 },
    { minute: 35, value: 260 },
    { minute: 40, value: 240 },
    { minute: 45, value: 220 },
    { minute: 50, value: 200 },
    { minute: 55, value: 180 },
    { minute: 60, value: 160 },
  ];

  // Sample pace data (in a real app, this would come from the API)
  const paceData = activity?.activity_type?.toLowerCase().includes("run") ? [
    { km: 1, pace: "4:30" },
    { km: 2, pace: "4:35" },
    { km: 3, pace: "4:40" },
    { km: 4, pace: "4:50" },
    { km: 5, pace: "4:45" },
    { km: 6, pace: "4:55" },
    { km: 7, pace: "5:00" },
    { km: 8, pace: "5:05" },
    { km: 9, pace: "4:50" },
    { km: 10, pace: "4:40" },
  ] : null;

  // Calculate heart rate zones percentages
  const heartRateZones = [
    { name: "Zone 1", percentage: 15, color: "bg-green-400" },
    { name: "Zone 2", percentage: 35, color: "bg-blue-400" },
    { name: "Zone 3", percentage: 30, color: "bg-yellow-400" },
    { name: "Zone 4", percentage: 15, color: "bg-orange-400" },
    { name: "Zone 5", percentage: 5, color: "bg-red-400" },
  ];

  // Handle sharing activity
  const handleShare = () => {
    // In a real app, implement sharing logic
    toast({
      title: "Sharing Feature",
      description: "This feature would share your activity details",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/4 bg-muted rounded"></div>
            <div className="h-12 w-2/3 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-60 bg-muted rounded"></div>
              <div className="h-60 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Show error state
  if (isError || !activity) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Error Loading Activity</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Activity not found or couldn't be loaded"}
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back to Training
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="mb-4 -ml-3 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{activity.activity_type}</h1>
              <p className="text-muted-foreground mt-1 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {formatDate(activity.date)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleShare}>
                Share Activity
              </Button>
            </div>
          </div>
        </div>
        
        {/* Activity Summary Card */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-semibold">Activity Summary</h2>
          </CardHeader>
          <CardContent>
            <MetricsSection activity={activity} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {activity.distance && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Distance</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{activity.distance?.toFixed(2)}</span>
                    <span className="text-muted-foreground mb-1">kilometers</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Duration</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{formatMinutesToHoursAndMinutes(activity.duration / 60)}</span>
                </div>
              </div>
              
              {activity.calories && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="font-medium">Calories</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{activity.calories}</span>
                    <span className="text-muted-foreground mb-1">kcal</span>
                  </div>
                </div>
              )}
              
              {activity.avg_heart_rate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h3 className="font-medium">Heart Rate</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{activity.avg_heart_rate}</span>
                    <span className="text-muted-foreground mb-1">bpm avg</span>
                    {activity.max_heart_rate && (
                      <span className="text-muted-foreground mb-1">
                        / {activity.max_heart_rate} max
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="overview" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
            {activity.avg_power && <TabsTrigger value="power">Power</TabsTrigger>}
            {paceData && <TabsTrigger value="pace">Pace</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Performance Overview</h3>
              </CardHeader>
              <CardContent>
                {activity.avg_heart_rate && (
                  <div className="space-y-4 mb-6">
                    <h4 className="font-medium">Heart Rate Zones</h4>
                    <div className="h-8 w-full rounded-md bg-muted/30 overflow-hidden flex">
                      {heartRateZones.map((zone, index) => (
                        <div
                          key={index}
                          className={`h-full ${zone.color}`}
                          style={{ width: `${zone.percentage}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      {heartRateZones.map((zone, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <span>{zone.name}</span>
                          <span>{zone.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activity.avg_power && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Power Output
                        </h4>
                        <div className="text-sm">
                          <span className="font-medium">{activity.avg_power} W</span>
                          <span className="text-muted-foreground"> avg</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-500 h-full" 
                          style={{ width: `${(activity.avg_power / 300) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 W</span>
                        <span>150 W</span>
                        <span>300 W</span>
                      </div>
                    </div>
                  )}
                  
                  {activity.avg_heart_rate && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium flex items-center">
                          <Heart className="mr-2 h-4 w-4 text-red-500" />
                          Heart Rate
                        </h4>
                        <div className="text-sm">
                          <span className="font-medium">{activity.avg_heart_rate} bpm</span>
                          <span className="text-muted-foreground"> avg</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full" 
                          style={{ width: `${(activity.avg_heart_rate / 200) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 bpm</span>
                        <span>100 bpm</span>
                        <span>200 bpm</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="heartRate">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Heart Rate Analysis</h3>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartRateData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="minute" 
                        label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip formatter={(value) => [`${value} bpm`, 'Heart Rate']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-8" />
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Heart Rate Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Average</div>
                        <div className="text-2xl font-semibold mt-1">{activity.avg_heart_rate} bpm</div>
                      </div>
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Maximum</div>
                        <div className="text-2xl font-semibold mt-1">{activity.max_heart_rate || '-'} bpm</div>
                      </div>
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Time in Zone 2</div>
                        <div className="text-2xl font-semibold mt-1">35%</div>
                      </div>
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Time in Zone 3+</div>
                        <div className="text-2xl font-semibold mt-1">50%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="power">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Power Analysis</h3>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={powerData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="minute" 
                        label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Power (watts)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip formatter={(value) => [`${value} watts`, 'Power']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ca8a04" 
                        strokeWidth={2}
                        dot={{ fill: '#ca8a04', strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: '#ca8a04', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-8" />
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Power Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Average</div>
                        <div className="text-2xl font-semibold mt-1">{activity.avg_power} W</div>
                      </div>
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Maximum</div>
                        <div className="text-2xl font-semibold mt-1">{activity.max_power || '-'} W</div>
                      </div>
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Normalized</div>
                        <div className="text-2xl font-semibold mt-1">{Math.round(activity.avg_power * 1.05)} W</div>
                      </div>
                      <div className="bg-card border rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">Work</div>
                        <div className="text-2xl font-semibold mt-1">{Math.round(activity.avg_power * activity.duration / 60)} kJ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {paceData && (
            <TabsContent value="pace">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Pace Analysis</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={paceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="km" 
                          label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }} 
                        />
                        <YAxis 
                          label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }} 
                          tickFormatter={(value) => value}
                        />
                        <Tooltip formatter={(value) => [value, 'Pace']} />
                        <Bar 
                          dataKey="pace" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Pace Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-muted-foreground text-sm">Average Pace</div>
                          <div className="text-2xl font-semibold mt-1">4:45 min/km</div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-muted-foreground text-sm">Best Split</div>
                          <div className="text-2xl font-semibold mt-1">4:30 min/km</div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-muted-foreground text-sm">Last Split</div>
                          <div className="text-2xl font-semibold mt-1">4:40 min/km</div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-muted-foreground text-sm">Pace Variability</div>
                          <div className="text-2xl font-semibold mt-1">±3.5%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default TrainingDetailPage;
