
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
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolarChartData } from "@/hooks/use-mqtt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";

interface SolarHistoryChartProps {
  data: SolarChartData | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onRefresh: () => void;
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl text-[11px] font-bold space-y-2">
        <p className="text-primary border-b border-border pb-1 mb-1">{data.rangeLabel}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const namesMap: Record<string, string> = {
              achat: 'Achat',
              vente: 'Vente',
              chargeBatterie: 'Charge Batterie',
              dechargeBatterie: 'Décharge Batterie',
              autoConsommation: 'Auto-Conso.',
              production: 'Production',
              estimation: 'Estimation'
            };
            const name = namesMap[entry.dataKey] || entry.name;
            return (
              <div key={index} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{name}:</span>
                <span>{entry.value.toFixed(2)} kWh</span>
              </div>
            );
          })}
        </div>
        {data.batterieSoc !== null && data.batterieSoc !== undefined && (
          <p className="border-t border-border pt-1 mt-1 text-accent">
            Le soc batterie à {data.label} est de {data.batterieSoc} %
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function SolarHistoryChart({ 
  data, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onRefresh 
}: SolarHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.multi) return [];
    
    return data.multi.Label.map((label, i) => {
      const [hours, minutes] = label.split(':');
      const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
      const nextLabel = `${nextHour}:${minutes}`;

      return {
        label,
        rangeLabel: `${label} - ${nextLabel}`,
        achat: parseFloat((data.multi.Achat[i] || 0).toFixed(2)),
        vente: parseFloat((data.multi.Vente[i] || 0).toFixed(2)),
        autoConsommation: parseFloat((data.multi.AutoConsommation[i] || 0).toFixed(2)),
        production: parseFloat((data.multi.Production[i] || 0).toFixed(2)),
        chargeBatterie: parseFloat((data.multi.BatterieCharge[i] || 0).toFixed(2)),
        dechargeBatterie: parseFloat((data.multi.BatterieDecharge[i] || 0).toFixed(2)),
        estimation: parseFloat((data.multi.Estimation[i] || 0).toFixed(2)),
        batterieSoc: data.multi.BatterieSoc ? data.multi.BatterieSoc[i] : null,
      };
    });
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
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-bold">Flux Énergétiques (kWh)</CardTitle>
        <div className="flex flex-wrap items-center gap-3 bg-secondary/20 p-2 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => onStartDateChange(e.target.value)} 
              className="h-8 w-36 text-[11px] font-bold"
            />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">au</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => onEndDateChange(e.target.value)} 
              className="h-8 w-36 text-[11px] font-bold"
            />
          </div>
          <Button size="sm" variant="secondary" onClick={onRefresh} className="h-8 px-3 gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase">Actualiser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
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
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={70}
                formatter={(value: string) => {
                    const totalKey = value === 'chargeBatterie' ? 'chargeBatterie' : 
                                   value === 'dechargeBatterie' ? 'dechargeBatterie' : 
                                   value === 'autoConsommation' ? 'autoConsommation' : value as keyof typeof totals;
                    
                    if (value === 'achat' && totals) return `Achat (Tot: ${totals.achat} - HC: ${totals.hc}, HP: ${totals.hp})`;
                    
                    let label = value;
                    if (value === 'chargeBatterie') label = 'Charge Batterie';
                    if (value === 'dechargeBatterie') label = 'Décharge Batterie';
                    if (value === 'autoConsommation') label = 'Auto-Conso.';

                    return totals ? `${label} (${totals[totalKey as keyof typeof totals]})` : label;
                }}
                wrapperStyle={{ color: 'black', fontSize: '10px', textTransform: 'capitalize', fontWeight: 'bold', paddingBottom: '20px' }}
              />
              
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
              
              <Bar dataKey="achat" stackId="a" fill={COLORS.achat} />
              <Bar dataKey="dechargeBatterie" stackId="a" fill={COLORS.dechargeBatterie} />
              <Bar dataKey="autoConsommation" stackId="a" fill={COLORS.autoConsommation} />
              
              <Bar dataKey="vente" stackId="a" fill={COLORS.vente} />
              <Bar dataKey="chargeBatterie" stackId="a" fill={COLORS.chargeBatterie} />
              
              <Line type="monotone" dataKey="production" stroke={COLORS.production} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="estimation" stroke={COLORS.estimation} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
