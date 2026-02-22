
"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolCastChartData } from "@/hooks/use-mqtt";
import { CloudSun } from "lucide-react";

interface SolarForecastChartProps {
  data: SolCastChartData | null;
}

const COLORS = {
  today: 'hsl(var(--primary))',
  tomorrow: 'hsl(var(--accent))',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl text-[11px] font-black space-y-2 text-black">
        <p className="text-black border-b border-border pb-1 mb-1 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const name = entry.name === 'today' ? "Aujourd'hui" : "Demain";
            return (
              <div key={index} className="flex justify-between gap-4 items-center">
                <span style={{ color: entry.color }}>{name}:</span>
                <span className="text-black font-black">{entry.value.toFixed(2)} kWh</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function SolarForecastChart({ data }: SolarForecastChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length < 3) return [];
    
    const labels = data[0].Label;
    const todayEnergy = data[1].Energy;
    const tomorrowEnergy = data[2].Energy;

    return labels.map((label, i) => ({
      label,
      today: parseFloat((todayEnergy[i] || 0).toFixed(2)),
      tomorrow: parseFloat((tomorrowEnergy[i] || 0).toFixed(2)),
    }));
  }, [data]);

  const totals = useMemo(() => {
    return chartData.reduce((acc, curr) => ({
      today: acc.today + curr.today,
      tomorrow: acc.tomorrow + curr.tomorrow
    }), { today: 0, tomorrow: 0 });
  }, [chartData]);

  if (!data) return null;

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-orange-400" />
          Prévision Solaire (kWh)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                formatter={(value) => {
                  const label = value === 'today' ? "Aujourd'hui" : "Demain";
                  const total = value === 'today' ? totals.today : totals.tomorrow;
                  return <span className="font-black" style={{ color: 'black' }}>{label} (Total: {total.toFixed(2)} kWh)</span>;
                }}
              />
              <Bar 
                dataKey="today" 
                fill={COLORS.today} 
                radius={[4, 4, 0, 0]} 
                name="today"
              />
              <Bar 
                dataKey="tomorrow" 
                fill={COLORS.tomorrow} 
                radius={[4, 4, 0, 0]} 
                name="tomorrow"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
