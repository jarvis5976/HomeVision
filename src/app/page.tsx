
"use client";

import { useState, useEffect } from "react";
import { MQTTProvider, useMQTT } from "@/hooks/use-mqtt";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { 
  Zap, 
  Battery as BatteryIcon, 
  Car, 
  Droplets, 
  Sun, 
  Home, 
  Building2, 
  CloudSun,
  Flame,
  Radio,
  PlayCircle,
  Moon,
  SunMedium,
  History
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { latestData, isSimulated, setIsSimulated } = useMQTT();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Handle Hydration & Theme
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('homevision-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('homevision-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const gridPower = latestData?.grid?.watts ?? 0;
  const solarProduction = latestData?.production?.total ?? 0;
  const batterySoc = latestData?.battery?.soc ?? 0;
  const batteryPower = latestData?.battery?.watts ?? 0;
  const houseConsumption = latestData?.energy?.total?.maison ?? 0;
  const annexeConsumption = latestData?.energy?.total?.annexe ?? 0;
  const totalWater = latestData?.eau?.total ?? 0;

  const vehicles = Object.entries(latestData?.voiture || {});

  const getZenFlexColor = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('eco')) return 'bg-emerald-600 hover:bg-emerald-700 text-white border-none';
    if (lower.includes('sobriété') || lower.includes('sobriete')) return 'bg-rose-600 hover:bg-rose-700 text-white border-none';
    return 'bg-slate-600 text-white border-none';
  };

  const getZenFlexOutlineColor = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('eco')) return 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
    if (lower.includes('sobriété') || lower.includes('sobriete')) return 'border-rose-500 text-rose-400 bg-rose-500/10';
    return 'border-slate-500 text-slate-400 bg-slate-500/10';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header with Title and Mode Toggle */}
      <header className="h-20 border-b border-border flex items-center justify-between px-8 sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">HomeVision</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
            <History className="w-4 h-4" />
            Historique
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 hover:bg-secondary"
          >
            {theme === 'dark' ? (
              <SunMedium className="w-5 h-5 text-orange-400" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </Button>

          <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

          <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-xl border border-border">
            <div className="flex items-center gap-2 pr-2 border-r border-border/50">
              <Switch 
                id="mode-toggle" 
                checked={!isSimulated} 
                onCheckedChange={(val) => setIsSimulated(!val)}
              />
              <Label htmlFor="mode-toggle" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer whitespace-nowrap">
                {isSimulated ? "Simulation" : "Réel"}
              </Label>
            </div>
            <div className="flex items-center gap-1.5 min-w-[100px]">
              {isSimulated ? (
                <PlayCircle className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              )}
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                {isSimulated ? "Demo" : "192.168.0.3"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-up duration-500">
        {/* Indicators Section (ZenFlex) */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            {latestData?.zenFlex?.couleurJourJ && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Aujourd'hui</span>
                <Badge className={cn("px-6 py-2.5 text-sm font-black shadow-lg transition-transform hover:scale-105", getZenFlexColor(latestData.zenFlex.couleurJourJ))}>
                  {latestData.zenFlex.couleurJourJ}
                </Badge>
              </div>
            )}
            {latestData?.zenFlex?.couleurJourJ1 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Demain</span>
                <Badge variant="outline" className={cn("px-6 py-2.5 text-sm font-black border-2 shadow-sm transition-transform hover:scale-105", getZenFlexOutlineColor(latestData.zenFlex.couleurJourJ1))}>
                  {latestData.zenFlex.couleurJourJ1}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
             <Badge variant="outline" className="flex items-center gap-3 px-5 py-3 bg-card border-border shadow-md">
              <CloudSun className="w-5 h-5 text-orange-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Prévision du jour</span>
                <span className="font-black text-xs">{latestData?.solCast?.today ?? 0} kWh</span>
              </div>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-3 px-5 py-3 bg-card border-border border-dashed shadow-sm">
              <CloudSun className="w-5 h-5 text-orange-300 opacity-70" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Demain</span>
                <span className="font-black text-xs">{latestData?.solCast?.tomorrow ?? 0} kWh</span>
              </div>
            </Badge>
          </div>
        </section>

        {/* Primary Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Réseau Electrique" 
            value={gridPower} 
            unit="W" 
            icon={Zap} 
            status={gridPower > 6000 ? 'alert' : 'online'}
            details={[
              { label: "Sens", value: latestData?.grid?.sens ?? "Achat" }
            ]}
          />
          <MetricCard 
            title="Production Solaire" 
            value={solarProduction} 
            unit="W" 
            icon={Sun} 
            details={[
              { label: "SolarEdge", value: latestData?.production?.detail?.solarEdge ?? 0, unit: "W" },
              { label: "APsystems", value: latestData?.production?.detail?.apSystems ?? 0, unit: "W" }
            ]}
          />
          <MetricCard 
            title="Batterie" 
            value={batterySoc} 
            unit="%" 
            icon={BatteryIcon} 
            status={batterySoc < 20 ? 'alert' : 'online'}
            description={latestData?.victron?.batteryTitle}
            details={[
              { label: "Système", value: latestData?.victron?.EssState?.label ?? "N/A" },
              { label: "Flux", value: batteryPower, unit: "W" },
              { label: "Tension", value: latestData?.battery?.voltage ?? 0, unit: "V" },
              { label: "Temp.", value: latestData?.battery?.temperature ?? 0, unit: "°C" }
            ]}
          />
          <MetricCard 
            title="Consommation Totale" 
            value={latestData?.energy?.total?.all ?? 0} 
            unit="W" 
            icon={Home} 
            details={[
              { label: "Maison", value: houseConsumption, unit: "W" },
              { label: "Annexe", value: annexeConsumption, unit: "W" }
            ]}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Détails de consommation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Maison Principale</span>
                    <span className="text-primary">{houseConsumption} W</span>
                  </div>
                  <Progress value={(houseConsumption / (latestData?.energy?.total?.all || 1)) * 100} className="h-3 bg-secondary/50" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-accent" /> Annexe</span>
                    <span className="text-accent">{annexeConsumption} W</span>
                  </div>
                  <Progress value={(annexeConsumption / (latestData?.energy?.total?.all || 1)) * 100} className="h-3 bg-secondary/50" />
                </div>
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-secondary/20 rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3">Chauffe-eau</p>
                    <p className="text-2xl font-black flex items-center gap-2 mb-4">
                      <Flame className="w-5 h-5 text-orange-500" />
                      {latestData?.chauffeEau?.total ?? 0} <span className="text-sm font-medium text-muted-foreground">W</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Maison</p>
                        <p className="text-sm font-black">{latestData?.chauffeEau?.maison ?? 0} <span className="text-[9px] font-normal">W</span></p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Annexe</p>
                        <p className="text-sm font-black">{latestData?.chauffeEau?.annexe ?? 0} <span className="text-[9px] font-normal">W</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3">Consommation Eau</p>
                    <p className="text-2xl font-black flex items-center gap-2 mb-4">
                      <Droplets className="w-5 h-5 text-blue-400" />
                      {totalWater} <span className="text-sm font-medium text-muted-foreground">m³</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Maison</p>
                        <p className="text-sm font-black">{latestData?.eau?.maison ?? 0} <span className="text-[9px] font-normal">m³</span></p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Annexe</p>
                        <p className="text-sm font-black">{latestData?.eau?.annexe ?? 0} <span className="text-[9px] font-normal">m³</span></p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Compteur</p>
                        <p className="text-sm font-black">{latestData?.eau?.compteur ?? 0} <span className="text-[9px] font-normal">m³</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8">
            {/* Vehicles Carousel */}
            {vehicles.length > 0 && (
              <div className="relative">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-1">Flotte Véhicules</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {vehicles.map(([id, car]) => (
                      <CarouselItem key={id}>
                        <Card className="border-border shadow-xl overflow-hidden bg-gradient-to-br from-card to-background">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                              <Car className="w-4 h-4 text-primary" />
                              {car.carModel}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 pt-2">
                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <p className="text-4xl font-black tracking-tighter">{car.batteryLevel}%</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                                  Autonomie: {car.range ?? 0} km
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                  {car.chargeStatus}
                                </p>
                                <p className="text-[9px] text-muted-foreground font-medium">
                                  Odo: {mounted ? Math.round(car.odometer ?? 0).toLocaleString() : Math.round(car.odometer ?? 0)} km
                                </p>
                              </div>
                            </div>
                            <Progress value={car.batteryLevel} className="h-2.5 bg-primary/10" />
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {vehicles.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                      <CarouselNext className="static translate-y-0 h-8 w-8" />
                    </div>
                  )}
                </Carousel>
              </div>
            )}
          </aside>
        </div>
      </main>
      
      <footer className="py-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] border-t border-border/50 mt-12">
        HomeVision Dashboard &copy; {mounted ? new Date().getFullYear() : ""}
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <MQTTProvider>
      <DashboardContent />
    </MQTTProvider>
  );
}
