
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailItem {
  label: string;
  value: string | number;
  unit?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  status?: 'online' | 'offline' | 'alert';
  details?: DetailItem[];
  description?: string;
}

export function MetricCard({ title, value, unit, icon: Icon, trend, status = 'online', details, description }: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {status === 'alert' && (
            <span className="flex h-2 w-2 rounded-full bg-destructive animate-ping" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
          {description && (
            <p className="text-[11px] font-bold text-primary mt-1 leading-tight uppercase tracking-tight">
              {description}
            </p>
          )}
          {trend !== undefined && (
            <p className={cn("text-[10px] mt-2 font-medium", trend >= 0 ? "text-accent" : "text-destructive")}>
              {trend >= 0 ? "+" : ""}{trend}% from last hour
            </p>
          )}
        </div>

        {details && details.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-2">
            {details.map((detail, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{detail.label}</span>
                <span className="text-sm font-black text-foreground">
                  {detail.value} <span className="text-[10px] font-normal opacity-70">{detail.unit}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
