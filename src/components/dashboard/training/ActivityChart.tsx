
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface ActivityChartProps {
  data: Array<{
    date: string;
    calories?: number;
    distance?: number;
    duration?: number;
    [key: string]: any;
  }>;
  dataKey: string;
  title: string;
  color?: string;
  unit?: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ 
  data, 
  dataKey, 
  title, 
  color = "#FC4C02", 
  unit = "" 
}) => {
  // Custom tooltip to show values with units
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs text-primary">
            {`${payload[0].value} ${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
