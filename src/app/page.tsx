
"use client";

import { MQTTProvider, useMQTT } from "@/hooks/use-mqtt";
import { Sidebar } from "@/components/dashboard/Sidebar";
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
  Flame
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { latestData } = useMQTT();

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
    if (lower.includes('eco')) return 'bg-emerald-500 hover:bg-emerald-600 text-white border-none';
    if (lower.includes('sobriété') || lower.includes('sobriete')) return 'bg-rose-500 hover:bg-rose-600 text-white border-none';
    return 'bg-slate-500 text-white border-none';
  };

  const getZenFlexOutlineColor = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('eco')) return 'border-emerald-500 text-emerald-700 bg-emerald-50';
    if (lower.includes('sobriété') || lower.includes('sobriete')) return 'border-rose-500 text-rose-700 bg-rose-50';
    return 'border-slate-300 text-slate-700 bg-slate-50';
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-border flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
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
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-up duration-500">
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Energy Center</h2>
                <p className="text-sm text-muted-foreground">Monitoring en temps réel de votre écosystème énergétique</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white">
                  <CloudSun className="w-3.5 h-3.5 text-orange-500" />
                  Prévision du jour : {latestData?.solCast?.today ?? 0} kWh
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white/50 border-dashed">
                  <CloudSun className="w-3.5 h-3.5 text-orange-400" />
                  Demain : {latestData?.solCast?.tomorrow ?? 0} kWh
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
              
              <div className="grid grid-cols-1 gap-8">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Détails de consommation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Maison Principale</span>
                        <span>{houseConsumption} W</span>
                      </div>
                      <Progress value={(houseConsumption / (latestData?.energy?.total?.all || 1)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Annexe</span>
                        <span>{annexeConsumption} W</span>
                      </div>
                      <Progress value={(annexeConsumption / (latestData?.energy?.total?.all || 1)) * 100} className="h-2" />
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-secondary rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Chauffe-eau</p>
                        <p className="text-lg font-bold flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {latestData?.chauffeEau?.total ?? 0} W
                        </p>
                      </div>
                      <div className="p-3 bg-secondary rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Consommation Eau</p>
                        <p className="text-lg font-bold flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          {totalWater} m³
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <aside className="space-y-8">
              {/* Vehicles Carousel */}
              {vehicles.length > 0 && (
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {vehicles.map(([id, car]) => (
                        <CarouselItem key={id}>
                          <Card className="border-none shadow-sm overflow-hidden bg-primary/5 border-primary/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Car className="w-4 h-4 text-primary" />
                                {car.carModel}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-2">
                              <div className="flex items-end justify-between mb-4">
                                <div>
                                  <p className="text-3xl font-bold">{car.batteryLevel}%</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    Autonomie: {car.range ?? 0} km
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-primary uppercase">
                                    {car.chargeStatus}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    Odomètre: {Math.round(car.odometer ?? 0)} km
                                  </p>
                                </div>
                              </div>
                              <Progress value={car.batteryLevel} className="h-2.5 bg-primary/20" />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {vehicles.length > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <CarouselPrevious className="static translate-y-0" />
                        <CarouselNext className="static translate-y-0" />
                      </div>
                    )}
                  </Carousel>
                </div>
              )}

              {/* System Battery Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="text-base font-bold mb-4">Système de Batterie</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Flux d'énergie</p>
                      <p className="text-sm font-bold">{batteryPower} W</p>
                    </div>
                    <Badge variant={batteryPower > 0 ? "default" : "secondary"} className="text-[10px]">
                      {batteryPower > 0 ? 'Charge' : 'Décharge'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Tension</p>
                      <p className="text-sm font-bold">{latestData?.battery?.voltage ?? 0} V</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Temp.</p>
                      <p className="text-sm font-bold">{latestData?.battery?.temperature ?? 0} °C</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
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
