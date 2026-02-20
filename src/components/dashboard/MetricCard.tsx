
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  status?: 'online' | 'offline' | 'alert';
}

export function MetricCard({ title, value, unit, icon: Icon, trend, status = 'online' }: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {status === 'alert' && (
            <span className="flex h-2 w-2 rounded-full bg-destructive animate-ping" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
          {trend !== undefined && (
            <p className={cn("text-[10px] mt-2 font-medium", trend >= 0 ? "text-accent" : "text-destructive")}>
              {trend >= 0 ? "+" : ""}{trend}% from last hour
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
