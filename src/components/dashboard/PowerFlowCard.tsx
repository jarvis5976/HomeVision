
"use client";

import React, { useMemo } from "react";
import { useMQTT } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Zap, Battery, Home, Car } from "lucide-react";
import { cn } from "@/lib/utils";

export function PowerFlowCard() {
  const { latestData } = useMQTT();

  const flows = useMemo(() => {
    if (!latestData) return null;

    const solar = latestData.production?.total ?? 0;
    const gridRaw = latestData.grid?.watts ?? 0;
    const gridSens = latestData.grid?.sens?.toLowerCase() || "achat";
    const isExporting = gridSens === "vente";
    const grid = isExporting ? -gridRaw : gridRaw;

    const batteryWatts = latestData.battery?.watts ?? 0;
    const batterySoc = latestData.battery?.soc ?? 0;
    const batteryState = latestData.battery?.stateLabel?.toLowerCase() || "";
    const isBatteryCharging = batteryState.includes("charge") || batteryState.includes("charging");
    
    const house = latestData.energy?.total?.all ?? 0;
    const borneWatts = latestData.borne?.watts ?? 0;

    // Find the car that is currently charging to display its SOC
    const vehicles = Object.values(latestData.voiture || {});
    const chargingCar = vehicles.find(v => 
      v.chargeStatus && 
      v.chargeStatus.toLowerCase().includes("charge") && 
      !v.chargeStatus.toLowerCase().includes("pas")
    );
    // If no car is charging, take the first one or default to 0
    const carSoc = chargingCar?.batteryLevel ?? (vehicles[0]?.batteryLevel ?? 0);

    return {
      solar,
      grid,
      isExporting,
      battery: batteryWatts,
      isBatteryCharging,
      batterySoc,
      house,
      borneWatts,
      carSoc
    };
  }, [latestData]);

  if (!flows) return null;

  // Animation duration calculation (lower is faster)
  const getDuration = (watts: number) => {
    const absWatts = Math.abs(watts);
    if (absWatts < 20) return 0;
    // Range from 0.5s (very fast) to 4s (slow)
    return Math.max(0.6, Math.min(4, 4000 / absWatts));
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="pb-0 pt-6">
        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Flux Énergétique Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-10">
        <div className="relative w-full max-w-[700px] mx-auto aspect-[16/9] flex items-center justify-center">
          
          {/* SVG Background Lines */}
          <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Paths Connecting Nodes to Hub (Center: 50, 40) */}
            
            {/* 1. Solar to Hub */}
            <path d="M 50 15 L 50 40" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.solar > 20 && (
              <circle r="1.2" fill="#fbbf24" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.solar)}s`} repeatCount="indefinite" path="M 50 15 L 50 40" />
              </circle>
            )}

            {/* 2. Grid to Hub */}
            <path d="M 20 40 L 50 40" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {Math.abs(flows.grid) > 20 && (
              <circle r="1.2" fill={flows.isExporting ? "hsl(var(--primary))" : "#f43f5e"} filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.grid)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isExporting ? "M 50 40 L 20 40" : "M 20 40 L 50 40"} 
                />
              </circle>
            )}

            {/* 3. Hub to Battery (Now Bottom) */}
            <path d="M 50 40 L 50 65" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {Math.abs(flows.battery) > 20 && (
              <circle r="1.2" fill="#10b981" filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.battery)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isBatteryCharging ? "M 50 40 L 50 65" : "M 50 65 L 50 40"} 
                />
              </circle>
            )}

            {/* 4. Hub to Home (Now Right) */}
            <path d="M 50 40 L 80 40" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.house > 20 && (
              <circle r="1.2" fill="hsl(var(--primary))" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.house)}s`} repeatCount="indefinite" path="M 50 40 L 80 40" />
              </circle>
            )}

            {/* 5. Home to Borne (EV) (Now Top Right) */}
            <path d="M 80 40 L 80 15" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.borneWatts > 20 && (
              <circle r="1.2" fill="#3b82f6" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.borneWatts)}s`} repeatCount="indefinite" path="M 80 40 L 80 15" />
              </circle>
            )}
          </svg>

          {/* Central Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-4 h-4 rounded-full bg-background border-2 border-muted shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-ping" />
            </div>
          </div>

          {/* Solaire (Top) */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 relative">
              <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sun className="w-7 h-7 text-orange-500" />
            </div>
            <div className="text-center bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm">
              <p className="text-[11px] font-black text-orange-500 whitespace-nowrap">{flows.solar} W</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Solaire</p>
            </div>
          </div>

          {/* Réseau (Left) */}
          <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group">
            <div className={cn(
              "w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500",
              flows.isExporting ? "bg-primary/5 border-primary/20" : "bg-rose-500/5 border-rose-500/20"
            )}>
              <Zap className={cn("w-7 h-7", flows.isExporting ? "text-primary" : "text-rose-500")} />
            </div>
            <div className="text-center bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm">
              <p className={cn("text-[11px] font-black", flows.isExporting ? "text-primary" : "text-rose-500")}>
                {Math.abs(flows.grid)} W
              </p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
                {flows.isExporting ? "Vente" : "Import"}
              </p>
            </div>
          </div>

          {/* Batterie (Bottom) */}
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group">
            <div className="text-center bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm order-last mt-2">
              <p className="text-[11px] font-black text-emerald-500">{flows.batterySoc}%</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
                {flows.battery} W
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
              <Battery className="w-7 h-7 text-emerald-500 z-10" />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-emerald-500/10 transition-all duration-1000" 
                style={{ height: `${flows.batterySoc}%` }} 
              />
            </div>
          </div>

          {/* Maison (Right) */}
          <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm">
              <p className="text-[11px] font-black text-primary">{flows.house} W</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Maison</p>
            </div>
          </div>

          {/* Borne Recharge (Top Right) */}
          <div className="absolute top-[5%] right-[10%] flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
              <Car className="w-7 h-7 text-blue-500 z-10" />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-1000" 
                style={{ height: `${flows.carSoc}%` }} 
              />
            </div>
            <div className="text-center bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm">
              <p className="text-[11px] font-black text-blue-500">{flows.carSoc}%</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
                {flows.borneWatts} W
              </p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
