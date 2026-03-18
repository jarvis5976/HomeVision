
"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolarPowerChartData } from "@/hooks/use-mqtt";
import { SunMedium } from "lucide-react";

interface SolarPowerChartProps {
  data: SolarPowerChartData | null;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#f97316',
  '#8b5cf6',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl text-[11px] font-black space-y-2 text-black">
        <p className="text-black border-b border-border pb-1 mb-1 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 items-center">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-black uppercase">{entry.name}:</span>
              </span>
              <span className="text-black font-black">{entry.value.toFixed(0)} W</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SolarPowerChart({ data }: SolarPowerChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) return [];
    
    const labels = data[0].Label;
    const series = data.slice(1) as Array<{ name: string; data: number[] }>;

    return labels.map((label, i) => {
      const point: any = { label };
      series.forEach(s => {
        point[s.name] = s.data[i] || 0;
      });
      return point;
    });
  }, [data]);

  const seriesNames = useMemo(() => {
    if (!data || data.length < 2) return [];
    return data.slice(1).map((s: any) => s.name);
  }, [data]);

  if (!data) return null;

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <SunMedium className="w-5 h-5 text-orange-400" />
          Puissance Solaire (Watts)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                height={40}
                wrapperStyle={{ color: 'black', fontSize: '10px' }}
                formatter={(value) => <span className="font-black" style={{ color: 'black' }}>{value}</span>}
              />
              {seriesNames.map((name, i) => (
                <Line 
                  key={name}
                  type="monotone" 
                  dataKey={name} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
