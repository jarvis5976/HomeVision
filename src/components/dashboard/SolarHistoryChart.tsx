
"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolarChartData } from "@/hooks/use-mqtt";

interface SolarHistoryChartProps {
  data: SolarChartData | null;
}

const COLORS = {
  achat: '#6093ff',
  vente: '#BE99FF',
  chargeBatterie: '#FF99D1',
  dechargeBatterie: '#99FFB8',
  autoConsommation: '#ffaa66',
  production: 'grey',
  estimation: 'red'
};

export function SolarHistoryChart({ data }: SolarHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.multi) return [];
    
    return data.multi.Label.map((label, i) => ({
      label,
      achat: parseFloat((data.multi.Achat[i] || 0).toFixed(2)),
      vente: Math.abs(parseFloat((data.multi.Vente[i] || 0).toFixed(2))),
      autoConsommation: parseFloat((data.multi.AutoConsommation[i] || 0).toFixed(2)),
      production: parseFloat((data.multi.Production[i] || 0).toFixed(2)),
      chargeBatterie: Math.abs(parseFloat((data.multi.BatterieCharge[i] || 0).toFixed(2))),
      dechargeBatterie: parseFloat((data.multi.BatterieDecharge[i] || 0).toFixed(2)),
      estimation: parseFloat((data.multi.Estimation[i] || 0).toFixed(2)),
    }));
  }, [data]);

  const totals = useMemo(() => {
    if (!data || !data.multi) return null;
    const sum = (arr: number[]) => arr.reduce((a, b) => a + Math.abs(b), 0);
    
    return {
      achat: sum(data.multi.Achat).toFixed(2),
      vente: sum(data.multi.Vente).toFixed(2),
      autoConsommation: sum(data.multi.AutoConsommation).toFixed(2),
      production: sum(data.multi.Production).toFixed(2),
      chargeBatterie: sum(data.multi.BatterieCharge).toFixed(2),
      dechargeBatterie: sum(data.multi.BatterieDecharge).toFixed(2),
      estimation: sum(data.multi.Estimation).toFixed(2),
      hc: (data.multi.TotalHC || 0).toFixed(2),
      hp: (data.multi.TotalHP || 0).toFixed(2)
    };
  }, [data]);

  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    const label = payload.value;
    const isPeak = (label >= "08:00" && label <= "12:00") || (label >= "18:00" && label <= "19:00");
    const color = isPeak ? "red" : "green";

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={color}
          fontSize={10}
          fontWeight="bold"
        >
          {label}
        </text>
      </g>
    );
  };

  if (!data) return null;

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Flux Énergétiques (kWh)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="label" 
                tick={renderCustomAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="top" 
                height={60}
                formatter={(value: string) => {
                    if (value === 'achat' && totals) return `Achat (Tot: ${totals.achat} - HC: ${totals.hc}, HP: ${totals.hp})`;
                    const totalKey = value as keyof typeof totals;
                    return totals ? `${value} (${totals[totalKey]})` : value;
                }}
                wrapperStyle={{ fontSize: '10px', textTransform: 'capitalize', fontWeight: 'bold', paddingTop: '10px' }}
              />
              
              <Bar dataKey="achat" stackId="a" fill={COLORS.achat} radius={[4, 4, 0, 0]} />
              <Bar dataKey="vente" stackId="a" fill={COLORS.vente} />
              <Bar dataKey="chargeBatterie" stackId="a" fill={COLORS.chargeBatterie} />
              <Bar dataKey="dechargeBatterie" stackId="a" fill={COLORS.dechargeBatterie} />
              <Bar dataKey="autoConsommation" stackId="a" fill={COLORS.autoConsommation} />
              
              <Line type="monotone" dataKey="production" stroke={COLORS.production} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="estimation" stroke={COLORS.estimation} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
