
"use client";

import { useMemo, useState } from "react";
import { AnnualData, AnnualMetricItem } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnualSummaryTableProps {
  data: AnnualData | null;
}

type MetricType = 'production' | 'achat' | 'vente' | 'autoConsommation';

export function AnnualSummaryTable({ data }: AnnualSummaryTableProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('production');

  const metricArray = data?.[activeMetric] || [];

  const years = useMemo(() => {
    if (metricArray.length === 0) return [];
    const keys = new Set<string>();
    metricArray.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'mois') keys.add(key);
      });
    });
    return Array.from(keys).sort();
  }, [metricArray]);

  const getTrendInfo = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) return null;
    const diffPercent = ((current - previous) / previous) * 100;
    const isIncrease = current > previous;

    let isGood = false;
    if (activeMetric === 'production' || activeMetric === 'autoConsommation') {
      isGood = isIncrease;
    } else {
      // Pour Achat et Vente, une hausse est marquée en rouge
      isGood = !isIncrease;
    }

    return {
      percent: Math.abs(diffPercent).toFixed(1),
      isIncrease,
      isGood,
    };
  };

  if (!data || metricArray.length === 0) return null;

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Résumé Annuel
        </CardTitle>
        <Tabs value={activeMetric} onValueChange={(val) => setActiveMetric(val as MetricType)} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-secondary/20">
            <TabsTrigger value="production" className="text-[10px] uppercase font-bold px-4 py-2">Production</TabsTrigger>
            <TabsTrigger value="achat" className="text-[10px] uppercase font-bold px-4 py-2">Achat</TabsTrigger>
            <TabsTrigger value="vente" className="text-[10px] uppercase font-bold px-4 py-2">Vente</TabsTrigger>
            <TabsTrigger value="autoConsommation" className="text-[10px] uppercase font-bold px-4 py-2">Auto-Conso.</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest">Période</TableHead>
                {years.map(year => (
                  <TableHead key={year} className="text-center text-[10px] font-black uppercase tracking-widest">{year}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricArray.map((row: AnnualMetricItem) => (
                <TableRow key={row.mois} className={cn("border-border/50", row.mois === 'TOTAL' ? "bg-secondary/10" : "")}>
                  <TableCell className={cn("text-xs font-bold", row.mois === 'TOTAL' ? "font-black text-foreground" : "text-muted-foreground")}>
                    {row.mois}
                  </TableCell>
                  {years.map((year, idx) => {
                    const value = Number(row[year] || 0);
                    const prevYear = years[idx - 1];
                    const prevValue = prevYear ? Number(row[prevYear] || 0) : undefined;
                    const trend = getTrendInfo(value, prevValue);

                    return (
                      <TableCell key={year} className="text-center">
                        <div className="flex flex-col items-center gap-0">
                          <div className="flex items-center gap-1">
                            <span className={cn("text-xs", row.mois === 'TOTAL' ? "font-black" : "font-bold")}>
                              {value.toFixed(2)} <span className="text-[9px] font-normal opacity-60">kWh</span>
                            </span>
                            {trend && (
                              <span className={trend.isGood ? "text-emerald-500" : "text-rose-500"}>
                                {trend.isIncrease ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                              </span>
                            )}
                          </div>
                          {trend && (
                            <span className={cn(
                              "text-[9px] font-black",
                              trend.isGood ? "text-emerald-500" : "text-rose-500"
                            )}>
                              ({trend.percent}%)
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
