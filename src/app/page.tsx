"use client";

import { useState, useEffect } from "react";
import { MQTTProvider, useMQTT } from "@/hooks/use-mqtt";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SensorChart } from "@/components/dashboard/SensorChart";
import { 
  Zap, 
  Battery, 
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
  SunMedium
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

  // Handle Theme Toggle
  useEffect(() => {
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

  const chartData = [
    { time: "00:00", value: 2200 },
    { time: "04:00", value: 1800 },
    { time: "08:00", value: 3500 },
    { time: "12:00", value: 4200 },
    { time: "16:00", value: 4500 },
    { time: "20:00", value: gridPower },
    { time: "23:59", value: 2500 },
  ];

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
      {/* Header with Title and ZenFlex Info */}
      <header className="h-20 border-b border-border flex items-center justify-between px-8 sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">HomeVision</h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            {latestData?.zenFlex?.couleurJourJ && (
              <Badge className={cn("px-4 py-1.5 font-bold shadow-sm transition-colors", getZenFlexColor(latestData.zenFlex.couleurJourJ))}>
                {latestData.zenFlex.couleurJourJ}
              </Badge>
            )}
            {latestData?.zenFlex?.couleurJourJ1 && (
              <Badge variant="outline" className={cn("px-4 py-1.5 font-semibold border-2", getZenFlexOutlineColor(latestData.zenFlex.couleurJourJ1))}>
                {latestData.zenFlex.couleurJourJ1}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Energy Center</h2>
              <p className="text-sm text-muted-foreground mt-1">Monitoring en temps réel de votre écosystème énergétique</p>
            </div>
            <div className="flex flex-wrap gap-3">
               <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-card border-border shadow-sm">
                <CloudSun className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-xs">Prévision du jour : {latestData?.solCast?.today ?? 0} kWh</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-card border-border border-dashed shadow-sm">
                <CloudSun className="w-4 h-4 text-orange-300 opacity-70" />
                <span className="font-medium text-xs text-muted-foreground">Demain : {latestData?.solCast?.tomorrow ?? 0} kWh</span>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Réseau Electrique" 
              value={gridPower} 
              unit="W" 
              icon={Zap} 
              status={gridPower > 6000 ? 'alert' : 'online'}
            />
            <MetricCard 
              title="Production Solaire" 
              value={solarProduction} 
              unit="W" 
              icon={Sun} 
            />
            <MetricCard 
              title="Batterie" 
              value={batterySoc} 
              unit="%" 
              icon={Battery} 
              status={batterySoc < 20 ? 'alert' : 'online'}
            />
            <MetricCard 
              title="Consommation Totale" 
              value={latestData?.energy?.total?.all ?? 0} 
              unit="W" 
              icon={Home} 
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SensorChart title="Charge Totale (24h)" data={chartData} />
            
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
                <div className="pt-6 grid grid-cols-2 gap-6">
                  <div className="p-4 bg-secondary/20 rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Chauffe-eau</p>
                    <p className="text-2xl font-black flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      {latestData?.chauffeEau?.total ?? 0} <span className="text-sm font-medium text-muted-foreground">W</span>
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Consommation Eau</p>
                    <p className="text-2xl font-black flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-400" />
                      {totalWater} <span className="text-sm font-medium text-muted-foreground">m³</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8">
            {/* Vehicles Carousel */}
            {vehicles.length > 0 && (
              <div className="relative">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Flotte Véhicules</h3>
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
                                  Odo: {Math.round(car.odometer ?? 0).toLocaleString()} km
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

            {/* System Battery Overview */}
            <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Système de Batterie</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Flux d'énergie</p>
                    <p className="text-xl font-black">{batteryPower} <span className="text-xs font-medium text-muted-foreground">W</span></p>
                  </div>
                  <Badge variant={batteryPower > 0 ? "default" : "secondary"} className="text-[9px] font-black uppercase tracking-widest px-3">
                    {batteryPower > 0 ? 'Charge' : 'Décharge'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-6 px-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Tension</p>
                    <p className="text-lg font-black">{latestData?.battery?.voltage ?? 0} <span className="text-xs font-medium opacity-50">V</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Temp.</p>
                    <p className="text-lg font-black">{latestData?.battery?.temperature ?? 0} <span className="text-xs font-medium opacity-50">°C</span></p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <footer className="py-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] border-t border-border/50 mt-12">
        HomeVision Dashboard &copy; {new Date().getFullYear()}
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
