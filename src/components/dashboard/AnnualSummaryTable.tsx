
"use client";

import { useMemo, useState } from "react";
import { AnnualData } from "@/hooks/use-mqtt";
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

const MONTH_LABELS: Record<string, string> = {
  "TOTAL": "TOTAL",
  "01": "Janvier",
  "02": "Février",
  "03": "Mars",
  "04": "Avril",
  "05": "Mai",
  "06": "Juin",
  "07": "Juillet",
  "08": "Août",
  "09": "Septembre",
  "10": "Octobre",
  "11": "Novembre",
  "12": "Décembre",
};

export function AnnualSummaryTable({ data }: AnnualSummaryTableProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('production');

  const metricData = data?.[activeMetric] || {};
  const years = useMemo(() => Object.keys(metricData).sort(), [metricData]);
  const months = ["TOTAL", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  const getTrendInfo = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) return null;
    const diffPercent = ((current - previous) / previous) * 100;
    const isIncrease = current > previous;

    let isGood = false;
    if (activeMetric === 'production' || activeMetric === 'autoConsommation') {
      isGood = isIncrease;
    } else {
      // Pour Achat et Vente, une hausse est marquée en rouge (selon demande)
      isGood = !isIncrease;
    }

    return {
      percent: Math.abs(diffPercent).toFixed(1),
      isIncrease,
      isGood,
    };
  };

  if (!data) return null;

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
              {months.map(month => (
                <TableRow key={month} className={cn("border-border/50", month === 'TOTAL' ? "bg-secondary/10" : "")}>
                  <TableCell className={cn("text-xs font-bold", month === 'TOTAL' ? "font-black text-foreground" : "text-muted-foreground")}>
                    {MONTH_LABELS[month]}
                  </TableCell>
                  {years.map((year, idx) => {
                    const value = metricData[year]?.[month] || 0;
                    const prevYear = years[idx - 1];
                    const prevValue = prevYear ? metricData[prevYear]?.[month] : undefined;
                    const trend = getTrendInfo(value, prevValue);

                    return (
                      <TableCell key={year} className="text-center">
                        <div className="flex flex-col items-center gap-0">
                          <div className="flex items-center gap-1">
                            <span className={cn("text-xs", month === 'TOTAL' ? "font-black" : "font-bold")}>
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
