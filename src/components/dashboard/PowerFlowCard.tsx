
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
    return Math.max(0.6, Math.min(5, 4000 / absWatts));
  };

  /**
   * Système de coordonnées SVG (0-100)
   * MAISON (CENTRE): (50, 50)
   * SOLAIRE (HAUT): (50, 10)
   * RÉSEAU (GAUCHE): (10, 50)
   * BATTERIE (BAS): (50, 90)
   * BORNE (HAUT DROITE): (85, 25)
   * CUMULUS (BAS DROITE): (85, 75)
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

            {/* --- TRACÉS DES FLUX (Rectilignes) --- */}
            
            {/* 1. Solaire -> Maison (50, 10 -> 50, 50) */}
            <path d="M 50 18 L 50 42" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.solar > 20 && (
              <circle r="0.8" fill="#fbbf24" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.solar)}s`} repeatCount="indefinite" path="M 50 18 L 50 42" />
              </circle>
            )}

            {/* 2. Réseau <-> Maison (10, 50 <-> 50, 50) */}
            <path d="M 18 50 L 42 50" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {Math.abs(flows.grid) > 20 && (
              <circle r="0.8" fill={flows.isExporting ? "#10b981" : "#f43f5e"} filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.grid)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isExporting ? "M 42 50 L 18 50" : "M 18 50 L 42 50"} 
                />
              </circle>
            )}

            {/* 3. Batterie <-> Maison (50, 90 <-> 50, 50) */}
            <path d="M 50 82 L 50 58" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {Math.abs(flows.battery) > 20 && (
              <circle r="0.8" fill="#10b981" filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.battery)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isBatteryCharging ? "M 50 58 L 50 82" : "M 50 82 L 50 58"} 
                />
              </circle>
            )}

            {/* 4. Maison -> Borne (50, 50 -> 85, 25) */}
            <path d="M 55 45 L 78 28" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.borneWatts > 20 && (
              <circle r="0.8" fill="#3b82f6" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.borneWatts)}s`} repeatCount="indefinite" path="M 55 45 L 78 28" />
              </circle>
            )}

            {/* 5. Maison -> Cumulus (50, 50 -> 85, 75) */}
            <path d="M 55 55 L 78 72" className="stroke-muted/20" strokeWidth="0.4" fill="none" />
            {flows.cumulusWatts > 20 && (
              <circle r="0.8" fill="#f97316" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.cumulusWatts)}s`} repeatCount="indefinite" path="M 55 55 L 78 72" />
              </circle>
            )}

            {/* --- COMPOSANTS (Utilisation de foreignObject avec tailles fixes pour éviter le cropping) --- */}

            {/* MAISON (CENTRE) */}
            <foreignObject x="40" y="42" width="20" height="24" className="overflow-visible">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center shadow-xl bg-background/95 backdrop-blur-md">
                  <Home className="w-7 h-7 text-primary" />
                </div>
                <div className="bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-black text-primary text-center leading-none">{flows.house}W</p>
                </div>
              </div>
            </foreignObject>

            {/* SOLAIRE (HAUT) */}
            <foreignObject x="42" y="0" width="16" height="20" className="overflow-visible">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-sm bg-background/80 backdrop-blur-md">
                  <Sun className="w-6 h-6 text-orange-500" />
                </div>
                <div className="bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                  <p className="text-[9px] font-black text-orange-600 text-center">{flows.solar}W</p>
                </div>
              </div>
            </foreignObject>

            {/* RÉSEAU (GAUCHE) */}
            <foreignObject x="2" y="40" width="16" height="20" className="overflow-visible">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm bg-background/80 backdrop-blur-md",
                  flows.isExporting ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                )}>
                  <Zap className={cn("w-6 h-6", flows.isExporting ? "text-emerald-500" : "text-rose-500")} />
                </div>
                <div className="bg-card/90 px-2 py-0.5 rounded-full border border-border/50">
                  <p className={cn("text-[9px] font-black text-center", flows.isExporting ? "text-emerald-600" : "text-rose-600")}>
                    {Math.abs(flows.grid)}W
                  </p>
                </div>
              </div>
            </foreignObject>

            {/* BATTERIE (BAS) */}
            <foreignObject x="42" y="80" width="16" height="20" className="overflow-visible">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-sm bg-background/80 backdrop-blur-md relative overflow-hidden">
                  <Battery className="w-6 h-6 text-emerald-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/30" style={{ height: `${flows.batterySoc}%` }} />
                </div>
                <div className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-600 text-center">{flows.batterySoc}%</p>
                </div>
              </div>
            </foreignObject>

            {/* BORNE (HAUT DROITE) */}
            <foreignObject x="78" y="15" width="16" height="20" className="overflow-visible">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-sm bg-background/80 backdrop-blur-md relative overflow-hidden">
                  <Car className="w-6 h-6 text-blue-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500/30" style={{ height: `${flows.carSoc}%` }} />
                </div>
                <div className="bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <p className="text-[10px] font-black text-blue-600 text-center">{flows.carSoc}%</p>
                </div>
              </div>
            </foreignObject>

            {/* CUMULUS (BAS DROITE) */}
            <foreignObject x="78" y="65" width="16" height="20" className="overflow-visible">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center shadow-sm bg-background/80 backdrop-blur-md">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="bg-orange-600/10 px-2 py-0.5 rounded-full border border-orange-600/20">
                  <p className="text-[9px] font-black text-orange-600 text-center">{flows.cumulusWatts}W</p>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
