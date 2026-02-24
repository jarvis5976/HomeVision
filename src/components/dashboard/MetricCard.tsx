
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface DetailItem {
  label: string;
  value: string | number;
  unit?: string;
}

interface MetricCardProps {
  title: string;
  titleExtra?: React.ReactNode;
  value: string | number;
  unit?: string;
  valueExtra?: React.ReactNode;
  icon: LucideIcon;
  trend?: number;
  status?: 'online' | 'offline' | 'alert';
  details?: DetailItem[];
  description?: string;
  showSeparator?: boolean;
}

export function MetricCard({ 
  title, 
  titleExtra,
  value, 
  unit, 
  valueExtra,
  icon: Icon, 
  trend, 
  status = 'online', 
  details, 
  description,
  showSeparator = false
}: MetricCardProps) {

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow h-full bg-card">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{title}</p>
                {titleExtra && <div className="flex items-center">{titleExtra}</div>}
              </div>
            </div>
          </div>
          {status === 'alert' && (
            <span className="flex h-2 w-2 rounded-full bg-destructive animate-ping" />
          )}
        </div>

        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
            {unit && <span className="text-sm font-bold text-muted-foreground uppercase">{unit}</span>}
          </div>

          {(showSeparator || (details && details.length > 0) || valueExtra) && (
            <Separator orientation="vertical" className="h-10 bg-border/60" />
          )}

          <div className="flex flex-col justify-center gap-1">
            {valueExtra && <div>{valueExtra}</div>}
            {details && details.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-2 leading-none">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{detail.label} :</span>
                <span className="text-[11px] font-black text-foreground">
                  {detail.value} <span className="text-[9px] font-normal opacity-70">{detail.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {description && (
          <p className="text-[10px] font-black text-primary mt-4 leading-tight uppercase tracking-widest">
            {description}
          </p>
        )}
        
        {trend !== undefined && (
          <p className={cn("text-[10px] mt-2 font-medium", trend >= 0 ? "text-accent" : "text-destructive")}>
            {trend >= 0 ? "+" : ""}{trend}% from last hour
          </p>
        )}
      </CardContent>
    </Card>
  );
}
