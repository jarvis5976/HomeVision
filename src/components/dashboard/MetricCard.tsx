"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface DetailItem {
  label: string;
  value: string | number;
  unit?: string;
  valueClassName?: string;
}

interface DistributionInfo {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}

interface TargetProgress {
  current: number;
  target: number;
  unit?: string;
}

interface MetricCardProps {
  title: string;
  titleExtra?: React.ReactNode;
  value: string | number;
  unit?: string;
  valueExtra?: React.ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: number;
  status?: 'online' | 'offline' | 'alert';
  details?: DetailItem[];
  distribution?: DistributionInfo;
  targetProgress?: TargetProgress;
  description?: string;
  showSeparator?: boolean;
  detailsLayout?: 'side' | 'bottom';
}

export function MetricCard({ 
  title, 
  titleExtra,
  value, 
  unit, 
  valueExtra,
  icon: Icon, 
  iconClassName,
  trend, 
  status = 'online', 
  details, 
  distribution,
  targetProgress,
  description,
  showSeparator = false,
  detailsLayout = 'side'
}: MetricCardProps) {

  const isTargetReached = targetProgress && targetProgress.current >= targetProgress.target;

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow h-full bg-card">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Icon className={cn("w-5 h-5", iconClassName || "text-primary")} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest truncate">{title}</p>
              {titleExtra && <div className="flex items-center shrink-0">{titleExtra}</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
            {unit && <span className="text-sm font-bold text-muted-foreground uppercase ml-1">{unit}</span>}
          </div>

          {detailsLayout === 'side' && (showSeparator || (details && details.length > 0) || valueExtra) && (
            <Separator orientation="vertical" className="h-10 bg-border/60" />
          )}

          {detailsLayout === 'side' && (
            <div className="flex flex-col justify-center gap-1 min-w-0">
              {valueExtra && <div>{valueExtra}</div>}
              {details && details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 leading-none whitespace-nowrap">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{detail.label} :</span>
                  <span className={cn("text-[11px] font-black text-foreground", detail.valueClassName)}>
                    {detail.value} <span className="text-[9px] font-normal opacity-70">{detail.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {distribution && (
          <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-primary">{distribution.leftLabel} {distribution.leftValue}%</span>
              <span className="text-accent-foreground/60">{distribution.rightLabel} {distribution.rightValue}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${distribution.leftValue}%` }} 
              />
              <div 
                className="h-full bg-accent transition-all duration-500" 
                style={{ width: `${distribution.rightValue}%` }} 
              />
            </div>
          </div>
        )}

        {targetProgress && (
          <div className="mt-4 pt-8 border-t border-border/50 relative">
            <div className="relative h-2 w-full bg-secondary rounded-full">
              {/* Progress Fill */}
              <div 
                className={cn(
                  "absolute h-full rounded-full transition-all duration-500",
                  isTargetReached ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(100, targetProgress.current)}%` }}
              />
              
              {/* Target Marker (Cursor) */}
              <div 
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background shadow-lg transition-all duration-500 z-10",
                  isTargetReached ? "bg-emerald-500" : "bg-rose-500"
                )}
                style={{ left: `${targetProgress.target}%`, transform: 'translate(-50%, -50%)' }}
              />
              
              {/* Target Label ABOVE marker */}
              <div 
                className="absolute -top-6 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${targetProgress.target}%` }}
              >
                <span className={cn(
                  "text-[9px] font-black uppercase whitespace-nowrap",
                  isTargetReached ? "text-emerald-500" : "text-rose-500"
                )}>
                  Cible {targetProgress.target}{targetProgress.unit}
                </span>
                <div className="w-px h-1 bg-border/50 mt-1" />
              </div>
            </div>
          </div>
        )}

        {detailsLayout === 'bottom' && details && details.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-4">
            {details.map((detail, idx) => (
              <div key={idx} className="flex flex-col">
                {detail.label && (
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">{detail.label}</p>
                )}
                <p className={cn("text-sm font-black text-foreground", detail.valueClassName)}>
                  {detail.value} <span className="text-[10px] font-normal opacity-60">{detail.unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}

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