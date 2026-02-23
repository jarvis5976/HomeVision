
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
    return Math.max(0.6, Math.min(4, 4000 / absWatts));
  };

  /**
   * Système de coordonnées unifié (0-100)
   * Hub central: (40, 50)
   * Solaire: (40, 15). Taille 12 -> Bord bas: 15 + 6 = 21
   * Réseau: (10, 50). Taille 12 -> Bord droit: 10 + 6 = 16
   * Batterie: (40, 85). Taille 12 -> Bord haut: 85 - 6 = 79
   * Maison: (70, 50). Taille 14 -> Bord gauche: 70 - 7 = 63, Haut: 50-7=43, Bas: 50+7=57
   * Borne: (70, 20). Taille 12 -> Bord bas: 20 + 6 = 26
   * Cumulus: (70, 80). Taille 12 -> Bord haut: 80 - 6 = 74
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
        <div className="relative w-full max-w-[900px] mx-auto aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
          
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible select-none">
            <defs>
              <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Trajectoires Rectilignes */}
            
            {/* 1. Solaire -> Hub */}
            <path d="M 40 21 L 40 50" className="stroke-muted/20" strokeWidth="0.5" fill="none" />
            {flows.solar > 20 && (
              <circle r="0.8" fill="#fbbf24" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.solar)}s`} repeatCount="indefinite" path="M 40 21 L 40 50" />
              </circle>
            )}

            {/* 2. Réseau -> Hub */}
            <path d="M 16 50 L 40 50" className="stroke-muted/20" strokeWidth="0.5" fill="none" />
            {Math.abs(flows.grid) > 20 && (
              <circle r="0.8" fill={flows.isExporting ? "hsl(var(--primary))" : "#f43f5e"} filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.grid)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isExporting ? "M 40 50 L 16 50" : "M 16 50 L 40 50"} 
                />
              </circle>
            )}

            {/* 3. Hub <-> Batterie */}
            <path d="M 40 50 L 40 79" className="stroke-muted/20" strokeWidth="0.5" fill="none" />
            {Math.abs(flows.battery) > 20 && (
              <circle r="0.8" fill="#10b981" filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.battery)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isBatteryCharging ? "M 40 50 L 40 79" : "M 40 79 L 40 50"} 
                />
              </circle>
            )}

            {/* 4. Hub -> Maison */}
            <path d="M 40 50 L 63 50" className="stroke-muted/20" strokeWidth="0.5" fill="none" />
            {flows.house > 20 && (
              <circle r="0.8" fill="hsl(var(--primary))" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.house)}s`} repeatCount="indefinite" path="M 40 50 L 63 50" />
              </circle>
            )}

            {/* 5. Maison -> Borne */}
            <path d="M 70 43 L 70 26" className="stroke-muted/20" strokeWidth="0.5" fill="none" />
            {flows.borneWatts > 20 && (
              <circle r="0.8" fill="#3b82f6" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.borneWatts)}s`} repeatCount="indefinite" path="M 70 43 L 70 26" />
              </circle>
            )}

            {/* 6. Maison -> Cumulus */}
            <path d="M 70 57 L 70 74" className="stroke-muted/20" strokeWidth="0.5" fill="none" />
            {flows.cumulusWatts > 20 && (
              <circle r="0.8" fill="#f97316" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.cumulusWatts)}s`} repeatCount="indefinite" path="M 70 57 L 70 74" />
              </circle>
            )}

            {/* Hub Central Point */}
            <circle cx="40" cy="50" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--muted)/0.3)" strokeWidth="0.2" />
            <circle cx="40" cy="50" r="0.5" fill="hsl(var(--primary))">
                <animate attributeName="r" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Solaire (40, 15) */}
            <foreignObject x="34" y="5" width="12" height="18">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                <div className="w-full aspect-square rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center shadow-md bg-background/60 backdrop-blur-md transition-transform group-hover:scale-105">
                  <Sun className="w-[50%] h-[50%] text-orange-500" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border/50 shadow-sm min-w-0">
                  <p className="text-[14%] sm:text-[16%] font-black text-orange-500 text-center whitespace-nowrap">{flows.solar}W</p>
                </div>
              </div>
            </foreignObject>

            {/* Réseau (10, 50) */}
            <foreignObject x="4" y="40" width="12" height="20">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                <div className={cn(
                  "w-full aspect-square rounded-2xl border flex items-center justify-center shadow-md bg-background/60 backdrop-blur-md transition-all group-hover:scale-105",
                  flows.isExporting ? "bg-primary/5 border-primary/10" : "bg-rose-500/5 border-rose-500/10"
                )}>
                  <Zap className={cn("w-[50%] h-[50%]", flows.isExporting ? "text-primary" : "text-rose-500")} />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className={cn("text-[14%] sm:text-[16%] font-black text-center whitespace-nowrap", flows.isExporting ? "text-primary" : "text-rose-500")}>
                    {Math.abs(flows.grid)}W
                  </p>
                </div>
              </div>
            </foreignObject>

            {/* Batterie (40, 85) */}
            <foreignObject x="34" y="75" width="12" height="20">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                <div className="w-full aspect-square rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden transition-transform group-hover:scale-105">
                  <Battery className="w-[50%] h-[50%] text-emerald-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/20 transition-all duration-1000" style={{ height: `${flows.batterySoc}%` }} />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className="text-[14%] sm:text-[16%] font-black text-emerald-500 text-center whitespace-nowrap">{flows.batterySoc}%</p>
                </div>
              </div>
            </foreignObject>

            {/* Maison (70, 50) */}
            <foreignObject x="63" y="38" width="14" height="24">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                <div className="w-full aspect-square rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center shadow-lg bg-background/80 backdrop-blur-md transition-transform group-hover:scale-105">
                  <Home className="w-[55%] h-[55%] text-primary" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border shadow-sm">
                  <p className="text-[14%] sm:text-[16%] font-black text-primary text-center whitespace-nowrap">{flows.house}W</p>
                </div>
              </div>
            </foreignObject>

            {/* Borne (70, 20) */}
            <foreignObject x="64" y="8" width="12" height="20">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                <div className="w-full aspect-square rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden transition-transform group-hover:scale-105">
                  <Car className="w-[50%] h-[50%] text-blue-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-1000" style={{ height: `${flows.carSoc}%` }} />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className="text-[14%] sm:text-[16%] font-black text-blue-500 text-center whitespace-nowrap">{flows.carSoc}%</p>
                </div>
              </div>
            </foreignObject>

            {/* Cumulus (70, 80) */}
            <foreignObject x="64" y="72" width="12" height="20">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                <div className="w-full aspect-square rounded-2xl bg-orange-600/5 border border-orange-600/10 flex items-center justify-center shadow-md bg-background/60 backdrop-blur-md transition-transform group-hover:scale-105">
                  <Flame className="w-[50%] h-[50%] text-orange-600" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border/50 shadow-sm">
                  <p className="text-[14%] sm:text-[16%] font-black text-orange-600 text-center whitespace-nowrap">{flows.cumulusWatts}W</p>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
