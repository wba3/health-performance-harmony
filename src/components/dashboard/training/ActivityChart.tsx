
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, ToggleLeft } from "lucide-react";

interface DataSeriesConfig {
  key: string;
  color: string;
  unit: string;
  label: string;
}

interface ActivityChartProps {
  data: Array<{
    date: string;
    [key: string]: any;
  }>;
  dataKey: string;
  title: string;
  color?: string;
  unit?: string;
  series?: DataSeriesConfig[];
  chartType?: "bar" | "line";
}

const ActivityChart: React.FC<ActivityChartProps> = ({ 
  data, 
  dataKey, 
  title, 
  color = "#FC4C02", 
  unit = "",
  series,
  chartType = "bar"
}) => {
  // State for active metric and chart type
  const [activeMetric, setActiveMetric] = useState<string>(dataKey);
  const [activeChartType, setActiveChartType] = useState<"bar" | "line">(chartType);
  
  // If series is provided, use it to get color and unit for the active metric
  const activeSeries = series?.find((s) => s.key === activeMetric);
  const activeColor = activeSeries?.color || color;
  const activeUnit = activeSeries?.unit || unit;
  const activeLabel = activeSeries?.label || activeMetric;

  // Custom tooltip to show values with units
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs text-primary">
            {`${payload[0].value} ${activeUnit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        
        {series && series.length > 1 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <ToggleGroup type="single" value={activeMetric} onValueChange={(value) => value && setActiveMetric(value)}>
              {series.map((item) => (
                <ToggleGroupItem key={item.key} value={item.key} aria-label={`Show ${item.label}`} className="text-xs">
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <ToggleGroup type="single" value={activeChartType} onValueChange={(value) => value && setActiveChartType(value as "bar" | "line")}>
              <ToggleGroupItem value="bar" aria-label="Bar chart" className="p-2">
                <BarChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="line" aria-label="Line chart" className="p-2">
                <LineChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeChartType === "bar" ? (
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={activeMetric} fill={activeColor} radius={[4, 4, 0, 0]} name={activeLabel} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={activeMetric} 
                stroke={activeColor} 
                strokeWidth={2}
                dot={{ fill: activeColor, strokeWidth: 2, r: 4 }}
                activeDot={{ fill: activeColor, strokeWidth: 2, r: 6 }}
                name={activeLabel}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
