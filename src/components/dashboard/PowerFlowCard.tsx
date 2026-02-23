
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
    const carSoc = vehicles[0]?.batteryLevel ?? 0;

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
    return Math.max(0.6, Math.min(4, 4000 / absWatts));
  };

  /**
   * Système de coordonnées SVG (0-100)
   * Hub (Point Central): (40, 50)
   * Solaire: (40, 15)
   * Réseau: (10, 50)
   * Batterie: (40, 85)
   * Maison: (70, 50)
   * Borne: (70, 15)
   * Cumulus: (70, 85)
   */

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="pb-0 pt-6">
        <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Flux Énergétique Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-10">
        <div className="relative w-full max-w-[900px] mx-auto aspect-[16/9] flex items-center justify-center">
          
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible select-none">
            <defs>
              <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- TRACÉS DES FLUX (RECTILIGNES) --- */}
            
            {/* Solaire -> Hub (40, 50) */}
            <path d="M 40 23.5 L 40 50" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.solar > 20 && (
              <circle r="0.6" fill="#fbbf24" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.solar)}s`} repeatCount="indefinite" path="M 40 23.5 L 40 50" />
              </circle>
            )}

            {/* Réseau -> Hub (10, 50 -> 40, 50) */}
            <path d="M 16.5 50 L 40 50" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {Math.abs(flows.grid) > 20 && (
              <circle r="0.6" fill={flows.isExporting ? "hsl(var(--primary))" : "#f43f5e"} filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.grid)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isExporting ? "M 40 50 L 16.5 50" : "M 16.5 50 L 40 50"} 
                />
              </circle>
            )}

            {/* Hub <-> Batterie (40, 50 <-> 40, 85) */}
            <path d="M 40 50 L 40 76.5" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {Math.abs(flows.battery) > 20 && (
              <circle r="0.6" fill="#10b981" filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.battery)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isBatteryCharging ? "M 40 50 L 40 76.5" : "M 40 76.5 L 40 50"} 
                />
              </circle>
            )}

            {/* Hub -> Maison (40, 50 -> 63.5, 50) */}
            <path d="M 40 50 L 63.5 50" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.house > 20 && (
              <circle r="0.6" fill="hsl(var(--primary))" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.house)}s`} repeatCount="indefinite" path="M 40 50 L 63.5 50" />
              </circle>
            )}

            {/* Maison -> Borne (70, 42 -> 70, 23.5) */}
            <path d="M 70 42 L 70 23.5" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.borneWatts > 20 && (
              <circle r="0.6" fill="#3b82f6" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.borneWatts)}s`} repeatCount="indefinite" path="M 70 42 L 70 23.5" />
              </circle>
            )}

            {/* Maison -> Cumulus (70, 58 -> 70, 76.5) */}
            <path d="M 70 58 L 70 76.5" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.cumulusWatts > 20 && (
              <circle r="0.6" fill="#f97316" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.cumulusWatts)}s`} repeatCount="indefinite" path="M 70 58 L 70 76.5" />
              </circle>
            )}

            {/* --- COMPOSANTS (REPRÉSENTATIONS) --- */}

            {/* Solaire (40, 15) */}
            <foreignObject x="34" y="6" width="12" height="18">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center shadow-sm bg-background/60 backdrop-blur-md">
                  <Sun className="w-5 h-5 text-orange-500" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className="text-[9px] font-bold text-orange-500 text-center">{flows.solar}W</p>
                </div>
              </div>
            </foreignObject>

            {/* Réseau (10, 50) */}
            <foreignObject x="4" y="41" width="12" height="18">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm bg-background/60 backdrop-blur-md",
                  flows.isExporting ? "bg-primary/5 border-primary/10" : "bg-rose-500/5 border-rose-500/10"
                )}>
                  <Zap className={cn("w-5 h-5", flows.isExporting ? "text-primary" : "text-rose-500")} />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className={cn("text-[9px] font-bold text-center", flows.isExporting ? "text-primary" : "text-rose-500")}>
                    {Math.abs(flows.grid)}W
                  </p>
                </div>
              </div>
            </foreignObject>

            {/* Batterie (40, 85) */}
            <foreignObject x="34" y="76" width="12" height="18">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm order-2">
                  <p className="text-[9px] font-bold text-emerald-500 text-center">{flows.batterySoc}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-sm bg-background/60 backdrop-blur-md relative overflow-hidden order-1">
                  <Battery className="w-5 h-5 text-emerald-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/20" style={{ height: `${flows.batterySoc}%` }} />
                </div>
              </div>
            </foreignObject>

            {/* Maison (70, 50) */}
            <foreignObject x="64" y="40" width="12" height="20">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shadow-md bg-background/80 backdrop-blur-md">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border shadow-sm">
                  <p className="text-[9px] font-bold text-primary text-center">{flows.house}W</p>
                </div>
              </div>
            </foreignObject>

            {/* Borne (70, 15) */}
            <foreignObject x="64" y="6" width="12" height="18">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-sm bg-background/60 backdrop-blur-md relative overflow-hidden">
                  <Car className="w-5 h-5 text-blue-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500/20" style={{ height: `${flows.carSoc}%` }} />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className="text-[9px] font-bold text-blue-500 text-center">{flows.carSoc}%</p>
                </div>
              </div>
            </foreignObject>

            {/* Cumulus (70, 85) */}
            <foreignObject x="64" y="76" width="12" height="18">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm order-2">
                  <p className="text-[9px] font-bold text-orange-600 text-center">{flows.cumulusWatts}W</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-600/5 border border-orange-600/10 flex items-center justify-center shadow-sm bg-background/60 backdrop-blur-md order-1">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
