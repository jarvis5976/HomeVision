
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
    // Plus la puissance est élevée, plus les particules vont vite (durée plus courte)
    return Math.max(0.6, Math.min(4, 4000 / absWatts));
  };

  /**
   * Layout Coords (ViewBox 0 0 100 100)
   * Hub: (40, 50)
   * Solar: Center (40, 15), Connexion Bas (40, 21)
   * Grid: Center (10, 50), Connexion Droite (16, 50)
   * Battery: Center (40, 85), Connexion Haut (40, 79)
   * Maison: Center (70, 50), Connexion Gauche (63, 50), Connexion Droite (77, 50)
   * Borne: Center (90, 20), Connexion Bas (90, 26)
   * Cumulus: Center (90, 80), Connexion Haut (90, 74)
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
        <div className="relative w-full max-w-[800px] mx-auto aspect-[16/10] flex items-center justify-center">
          
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Trajectoires de flux */}
            
            {/* 1. Solaire -> Hub */}
            <path id="path-solar" d="M 40 21 L 40 50" className="stroke-muted/20" strokeWidth="0.8" fill="none" />
            {flows.solar > 20 && (
              <circle r="0.8" fill="#fbbf24" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.solar)}s`} repeatCount="indefinite" path="M 40 21 L 40 50" />
              </circle>
            )}

            {/* 2. Réseau -> Hub */}
            <path id="path-grid" d="M 16 50 L 40 50" className="stroke-muted/20" strokeWidth="0.8" fill="none" />
            {Math.abs(flows.grid) > 20 && (
              <circle r="0.8" fill={flows.isExporting ? "hsl(var(--primary))" : "#f43f5e"} filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.grid)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isExporting ? "M 40 50 L 16 50" : "M 16 50 L 40 50"} 
                />
              </circle>
            )}

            {/* 3. Hub -> Batterie */}
            <path id="path-battery" d="M 40 50 L 40 79" className="stroke-muted/20" strokeWidth="0.8" fill="none" />
            {Math.abs(flows.battery) > 20 && (
              <circle r="0.8" fill="#10b981" filter="url(#glow-path)">
                <animateMotion 
                  dur={`${getDuration(flows.battery)}s`} 
                  repeatCount="indefinite" 
                  path={flows.isBatteryCharging ? "M 40 50 L 40 79" : "M 40 79 L 40 50"} 
                />
              </circle>
            )}

            {/* 4. Hub -> Maison (S'arrête au bord gauche de la maison) */}
            <path id="path-house" d="M 40 50 L 63 50" className="stroke-muted/20" strokeWidth="0.8" fill="none" />
            {flows.house > 20 && (
              <circle r="0.8" fill="hsl(var(--primary))" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.house)}s`} repeatCount="indefinite" path="M 40 50 L 63 50" />
              </circle>
            )}

            {/* 5. Maison -> Borne (Part du bord droit en courbe de Bézier) */}
            <path id="path-borne" d="M 77 50 Q 90 50, 90 26" className="stroke-muted/20" strokeWidth="0.8" fill="none" />
            {flows.borneWatts > 20 && (
              <circle r="0.8" fill="#3b82f6" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.borneWatts)}s`} repeatCount="indefinite" path="M 77 50 Q 90 50, 90 26" />
              </circle>
            )}

            {/* 6. Maison -> Cumulus (Part du bord droit en courbe de Bézier) */}
            <path id="path-cumulus" d="M 77 50 Q 90 50, 90 74" className="stroke-muted/20" strokeWidth="0.8" fill="none" />
            {flows.cumulusWatts > 20 && (
              <circle r="0.8" fill="#f97316" filter="url(#glow-path)">
                <animateMotion dur={`${getDuration(flows.cumulusWatts)}s`} repeatCount="indefinite" path="M 77 50 Q 90 50, 90 74" />
              </circle>
            )}
          </svg>

          {/* Hub Central (Point de convergence invisible ou discret) */}
          <div className="absolute top-[50%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-4 h-4 rounded-full bg-background border border-muted/30 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" />
            </div>
          </div>

          {/* Composant: Solaire (Haut Centre) */}
          <div className="absolute top-[15%] left-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 bg-background/40 backdrop-blur-sm">
              <Sun className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-orange-500">{flows.solar} W</p>
            </div>
          </div>

          {/* Composant: Réseau (Milieu Gauche) */}
          <div className="absolute left-[10%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-500 bg-background/40 backdrop-blur-sm",
              flows.isExporting ? "bg-primary/5 border-primary/10" : "bg-rose-500/5 border-rose-500/10"
            )}>
              <Zap className={cn("w-6 h-6", flows.isExporting ? "text-primary" : "text-rose-500")} />
            </div>
            <div className="text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className={cn("text-[10px] font-black", flows.isExporting ? "text-primary" : "text-rose-500")}>
                {Math.abs(flows.grid)} W
              </p>
            </div>
          </div>

          {/* Composant: Batterie (Bas Centre) */}
          <div className="absolute top-[85%] left-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-500 relative overflow-hidden bg-background/40 backdrop-blur-sm">
              <Battery className="w-6 h-6 text-emerald-500 z-10" />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-emerald-500/15 transition-all duration-1000" 
                style={{ height: `${flows.batterySoc}%` }} 
              />
            </div>
            <div className="text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-emerald-500">{flows.batterySoc}% <span className="text-[8px] opacity-60">({flows.battery}W)</span></p>
            </div>
          </div>

          {/* Composant: Maison (Milieu Droite) */}
          <div className="absolute left-[70%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 bg-background/40 backdrop-blur-sm">
              <Home className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-primary">{flows.house} W</p>
            </div>
          </div>

          {/* Composant: Borne Recharge (Haut Droite) */}
          <div className="absolute left-[90%] top-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 relative overflow-hidden bg-background/40 backdrop-blur-sm">
              <Car className="w-6 h-6 text-blue-500 z-10" />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/15 transition-all duration-1000" 
                style={{ height: `${flows.carSoc}%` }} 
              />
            </div>
            <div className="text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-blue-500">{flows.carSoc}% <span className="text-[8px] opacity-60">({flows.borneWatts}W)</span></p>
            </div>
          </div>

          {/* Composant: Cumulus (Bas Droite) */}
          <div className="absolute left-[90%] top-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/5 border border-orange-600/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 bg-background/40 backdrop-blur-sm">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
              <p className="text-[10px] font-black text-orange-600">{flows.cumulusWatts} W</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
