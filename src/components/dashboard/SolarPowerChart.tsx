
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
  '#22c55e', // Vert pour SolarEdge
  '#3b82f6', // Bleu pour APsystems
  '#f97316',
  '#8b5cf6',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Nettoyage du label pour n'afficher que l'heure dans le tooltip aussi
    const cleanLabel = label.split(' ').pop();
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl text-[11px] font-black space-y-2 text-black dark:text-white">
        <p className="border-b border-border pb-1 mb-1 uppercase tracking-wider">{cleanLabel}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 items-center">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="uppercase">{entry.name}:</span>
              </span>
              <span className="font-black">{entry.value.toFixed(0)} W</span>
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
      const point: any = { 
        label,
        // On garde une version courte pour l'axe X (HH:mm)
        displayLabel: label.split(' ').pop() 
      };
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

  if (!data || chartData.length === 0) return null;

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
                dataKey="displayLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
                minTickGap={30}
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
                wrapperStyle={{ fontSize: '10px' }}
                formatter={(value) => <span className="font-black uppercase tracking-wider">{value}</span>}
              />
              {seriesNames.map((name, i) => (
                <Line 
                  key={name}
                  type="monotone" 
                  dataKey={name} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
