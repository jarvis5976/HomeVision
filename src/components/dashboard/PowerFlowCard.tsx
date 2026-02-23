
"use client";

import React, { useMemo } from "react";
import { useMQTT } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Zap, Battery, Home, Car, Flame } from "lucide-react";
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
    const cumulusWatts = latestData.chauffeEau?.total ?? 0;

    const vehicles = Object.values(latestData.voiture || {});
    const chargingCar = vehicles.find(v => 
      v.chargeStatus && 
      v.chargeStatus.toLowerCase().includes("charge") && 
      !v.chargeStatus.toLowerCase().includes("pas")
    );
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
      carSoc,
      cumulusWatts
    };
  }, [latestData]);

  if (!flows) return null;

  const getDuration = (watts: number) => {
    const absWatts = Math.abs(watts);
    if (absWatts < 20) return 0;
    // Vitesse proportionnelle : plus de puissance = plus rapide (durée plus courte)
    return Math.max(0.6, Math.min(4, 4000 / absWatts));
  };

  /**
   * Layout coordinates (viewBox 0 0 100 80)
   * Hub Center: (40, 40)
   * Solar: (40, 10)
   * Grid: (10, 40)
   * Battery: (40, 70)
   * Maison: (65, 40)
   * Borne: (90, 15)
   * Cumulus: (90, 65)
   * 
   * Courbes Bézier Quadratiques (Q controlX controlY, endX endY)
   */

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="pb-0 pt-6">
        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Flux Énergétique Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-10">
        <div className="relative w-full max-w-[800px] mx-auto aspect-[16/9] flex items-center justify-center">
          
          <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Trajectoires Hub */}
            
            {/* 1. Solar to Hub (Verticale) */}
            <path d="M 40 10 L 40 40" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.solar > 20 && (
              <circle r="1" fill="#fbbf24" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.solar)}s`} repeatCount="indefinite" path="M 40 10 L 40 40" />
              </circle>
            )}

            {/* 2. Grid to Hub (Horizontale) */}
            <path d="M 10 40 L 40 40" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {Math.abs(flows.grid) > 20 && (
              <circle r="1" fill={flows.isExporting ? "hsl(var(--primary))" : "#f43f5e"} filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.grid)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isExporting ? "M 40 40 L 10 40" : "M 10 40 L 40 40"} 
                />
              </circle>
            )}

            {/* 3. Hub to Battery (Verticale) */}
            <path d="M 40 40 L 40 70" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {Math.abs(flows.battery) > 20 && (
              <circle r="1" fill="#10b981" filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.battery)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isBatteryCharging ? "M 40 40 L 40 70" : "M 40 70 L 40 40"} 
                />
              </circle>
            )}

            {/* 4. Hub to Maison (Horizontale) */}
            <path d="M 40 40 L 65 40" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.house > 20 && (
              <circle r="1" fill="hsl(var(--primary))" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.house)}s`} repeatCount="indefinite" path="M 40 40 L 65 40" />
              </circle>
            )}

            {/* 5. Maison to Borne (Courbe descendante vers le haut) */}
            <path d="M 65 40 Q 80 40, 90 15" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.borneWatts > 20 && (
              <circle r="1" fill="#3b82f6" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.borneWatts)}s`} repeatCount="indefinite" path="M 65 40 Q 80 40, 90 15" />
              </circle>
            )}

            {/* 6. Maison to Cumulus (Courbe ascendante vers le bas) */}
            <path d="M 65 40 Q 80 40, 90 65" className="stroke-muted/20" strokeWidth="1" fill="none" />
            {flows.cumulusWatts > 20 && (
              <circle r="1" fill="#f97316" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.cumulusWatts)}s`} repeatCount="indefinite" path="M 65 40 Q 80 40, 90 65" />
              </circle>
            )}
          </svg>

          {/* Hub Central discret */}
          <div className="absolute top-[50%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-3 h-3 rounded-full bg-background border border-muted/30 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-primary/20 animate-pulse" />
            </div>
          </div>

          {/* Solaire (Haut) */}
          <div className="absolute top-[0%] left-[40%] -translate-x-1/2 flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
              <Sun className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-center bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-orange-500">{flows.solar} W</p>
            </div>
          </div>

          {/* Réseau (Gauche) */}
          <div className="absolute left-[0%] top-[50%] -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-500",
              flows.isExporting ? "bg-primary/5 border-primary/10" : "bg-rose-500/5 border-rose-500/10"
            )}>
              <Zap className={cn("w-6 h-6", flows.isExporting ? "text-primary" : "text-rose-500")} />
            </div>
            <div className="text-center bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className={cn("text-[10px] font-black", flows.isExporting ? "text-primary" : "text-rose-500")}>
                {Math.abs(flows.grid)} W
              </p>
            </div>
          </div>

          {/* Batterie (Bas) */}
          <div className="absolute bottom-[0%] left-[40%] -translate-x-1/2 flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
              <Battery className="w-6 h-6 text-emerald-500 z-10" />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-emerald-500/10 transition-all duration-1000" 
                style={{ height: `${flows.batterySoc}%` }} 
              />
            </div>
            <div className="text-center bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-emerald-500">{flows.batterySoc}% <span className="text-[8px] opacity-60">({flows.battery}W)</span></p>
            </div>
          </div>

          {/* Maison (Milieu Droite) */}
          <div className="absolute right-[25%] top-[50%] -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Home className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-primary">{flows.house} W</p>
            </div>
          </div>

          {/* Borne Recharge (Haut Droite) */}
          <div className="absolute top-[6%] right-[0%] flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
              <Car className="w-6 h-6 text-blue-500 z-10" />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-1000" 
                style={{ height: `${flows.carSoc}%` }} 
              />
            </div>
            <div className="text-center bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-blue-500">{flows.carSoc}% <span className="text-[8px] opacity-60">({flows.borneWatts}W)</span></p>
            </div>
          </div>

          {/* Cumulus (Bas Droite) */}
          <div className="absolute bottom-[6%] right-[0%] flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/5 border border-orange-600/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-orange-600">{flows.cumulusWatts} W</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
