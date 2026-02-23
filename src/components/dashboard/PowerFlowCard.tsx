
"use client";

import React, { useMemo } from "react";
import { useMQTT } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Zap, Battery, Home, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PowerFlowCard() {
  const { latestData } = useMQTT();

  // Extraction et normalisation des données
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
    // On assume que si stateLabel contient "charge" (en français ou anglais), on charge
    const isBatteryCharging = batteryState.includes("charge") || batteryState.includes("charging");
    
    const house = latestData.energy?.total?.all ?? 0;

    return {
      solar,
      grid,
      isExporting,
      battery: batteryWatts,
      isBatteryCharging,
      batterySoc,
      house
    };
  }, [latestData]);

  if (!flows) return null;

  // Calcul de la vitesse d'animation (plus c'est élevé, plus ça va vite)
  const getSpeed = (watts: number) => {
    const absWatts = Math.abs(watts);
    if (absWatts < 10) return 0;
    return Math.max(0.5, Math.min(3, absWatts / 2000));
  };

  return (
    <Card className="border-border bg-card shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter">
          <Zap className="w-5 h-5 text-primary" />
          Flux Énergétique Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative w-full max-w-[500px] mx-auto aspect-square sm:aspect-video flex items-center justify-center">
          
          {/* SVG Container for Lines */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
            {/* Definitions for animations and markers */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Path: Solar to Hub */}
            <path d="M 50 20 L 50 45" className="stroke-muted/30 fill-none" strokeWidth="1.5" strokeDasharray="2 2" />
            {flows.solar > 10 && (
              <path d="M 50 20 L 50 45" className="stroke-orange-400 fill-none" strokeWidth="1.5" strokeDasharray="4 8">
                <animate attributeName="stroke-dashoffset" from="12" to="0" dur={`${2 / getSpeed(flows.solar)}s`} repeatCount="indefinite" />
              </path>
            )}

            {/* Path: Grid to Hub */}
            <path d="M 20 50 L 45 50" className="stroke-muted/30 fill-none" strokeWidth="1.5" strokeDasharray="2 2" />
            {Math.abs(flows.grid) > 10 && (
              <path d="M 20 50 L 45 50" className={cn("fill-none", flows.isExporting ? "stroke-primary" : "stroke-rose-400")} strokeWidth="1.5" strokeDasharray="4 8">
                <animate attributeName="stroke-dashoffset" from={flows.isExporting ? "0" : "12"} to={flows.isExporting ? "12" : "0"} dur={`${2 / getSpeed(flows.grid)}s`} repeatCount="indefinite" />
              </path>
            )}

            {/* Path: Hub to Battery */}
            <path d="M 55 50 L 80 50" className="stroke-muted/30 fill-none" strokeWidth="1.5" strokeDasharray="2 2" />
            {Math.abs(flows.battery) > 10 && (
              <path d="M 55 50 L 80 50" className="stroke-emerald-400 fill-none" strokeWidth="1.5" strokeDasharray="4 8">
                <animate attributeName="stroke-dashoffset" from={flows.isBatteryCharging ? "12" : "0"} to={flows.isBatteryCharging ? "0" : "12"} dur={`${2 / getSpeed(flows.battery)}s`} repeatCount="indefinite" />
              </path>
            )}

            {/* Path: Hub to Home */}
            <path d="M 50 55 L 50 80" className="stroke-muted/30 fill-none" strokeWidth="1.5" strokeDasharray="2 2" />
            {flows.house > 10 && (
              <path d="M 50 55 L 50 80" className="stroke-primary fill-none" strokeWidth="1.5" strokeDasharray="4 8">
                <animate attributeName="stroke-dashoffset" from="12" to="0" dur={`${2 / getSpeed(flows.house)}s`} repeatCount="indefinite" />
              </path>
            )}
          </svg>

          {/* Icons and Labels */}
          {/* Solaire (Haut) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <Sun className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">{flows.solar} W</span>
          </div>

          {/* Réseau (Gauche) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className={cn("w-12 h-12 rounded-full bg-opacity-10 border-2 flex items-center justify-center transition-colors", 
              flows.isExporting ? "bg-primary border-primary" : "bg-rose-500 border-rose-500")}>
              <Zap className={cn("w-6 h-6", flows.isExporting ? "text-primary" : "text-rose-500")} />
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-wider", flows.isExporting ? "text-primary" : "text-rose-500")}>
              {Math.abs(flows.grid)} W
            </span>
            <span className="text-[8px] font-bold opacity-50 uppercase">{flows.isExporting ? "Vente" : "Import"}</span>
          </div>

          {/* Maison (Centre Bas) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(83,140,198,0.3)]">
              <Home className="w-7 h-7 text-primary" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">{flows.house} W</span>
          </div>

          {/* Batterie (Droite) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center overflow-hidden relative">
              <Battery className="w-6 h-6 text-emerald-500 z-10" />
              {/* Remplissage de la batterie visuel */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-emerald-500/20 transition-all duration-1000" 
                style={{ height: `${flows.batterySoc}%` }} 
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">{flows.batterySoc}%</span>
              <span className="text-[9px] font-bold opacity-70 text-emerald-600">{flows.battery} W</span>
            </div>
          </div>

          {/* Hub Central (Optionnel pour le style) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground/20 border border-muted-foreground/30 blur-[1px]" />
        </div>
      </CardContent>
    </Card>
  );
}
