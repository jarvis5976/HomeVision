
"use client";

import { useState, useEffect, useCallback } from "react";
import { MQTTProvider, useMQTT } from "@/hooks/use-mqtt";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SolarHistoryChart } from "@/components/dashboard/SolarHistoryChart";
import { SolarForecastChart } from "@/components/dashboard/SolarForecastChart";
import { AnnualSummaryTable } from "@/components/dashboard/AnnualSummaryTable";
import { DailyHistoryTable } from "@/components/dashboard/DailyHistoryTable";
import { 
  Zap, 
  Battery as BatteryIcon, 
  Car, 
  Droplets, 
  Sun, 
  Home, 
  Building2, 
  CloudSun,
  Radio,
  PlayCircle,
  Moon,
  SunMedium,
  History,
  Flame,
  ArrowLeft,
  TrendingUp,
  PieChart,
  Activity,
  CalendarDays,
  RefreshCw
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

type ViewType = 'dashboard' | 'history';

function DashboardContent() {
  const { 
    latestData, 
    historyData, 
    totalHistoryData, 
    solarChartData,
    solCastChartData,
    annualData,
    dailyHistoryData,
    isSimulated, 
    setIsSimulated,
    setIsPaused,
    fetchHistoryStats,
    fetchSolarChart,
    fetchSolCastChart,
    fetchAnnualData,
    fetchDailyHistory
  } = useMQTT();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('homevision-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Désactiver le polling instant_from_mqtt.php quand on est sur l'historique
  useEffect(() => {
    setIsPaused(view === 'history');
  }, [view, setIsPaused]);

  const refreshHistory = useCallback(() => {
    fetchHistoryStats();
    fetchSolarChart(startDate, endDate);
    fetchSolCastChart();
    fetchAnnualData();
    fetchDailyHistory();
  }, [fetchHistoryStats, fetchSolarChart, fetchSolCastChart, fetchAnnualData, fetchDailyHistory, startDate, endDate]);

  useEffect(() => {
    if (view === 'history') {
      refreshHistory();
    }
  }, [view, refreshHistory]);

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
  const houseConsumption = latestData?.energy?.total?.all ?? 0;
  const houseMain = latestData?.energy?.total?.maison ?? 0;
  const houseAnnexe = latestData?.energy?.total?.annexe ?? 0;

  const vehicles = Object.entries(latestData?.voiture || {});

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
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
          <Button 
            variant={view === 'history' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setView(view === 'history' ? 'dashboard' : 'history')}
            className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
          >
            {view === 'history' ? <ArrowLeft className="w-4 h-4" /> : <History className="w-4 h-4" />}
            {view === 'history' ? "Tableau de Bord" : "Historique"}
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
              <Label htmlFor="mode-toggle" className="text-[10px] font-black text-muted-foreground uppercase cursor-pointer whitespace-nowrap">
                {isSimulated ? "Simulation" : "Réel"}
              </Label>
            </div>
            <div className="flex items-center gap-1.5 min-w-[100px]">
              {isSimulated ? (
                <PlayCircle className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-primary" />
              )}
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">
                {isSimulated ? "Demo" : "192.168.0.3"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-up duration-500">
        
        {view === 'dashboard' ? (
          <>
            <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
              <div className="flex flex-wrap items-center gap-4">
                {latestData?.zenFlex?.couleurJourJ && (
                  <Badge className="px-6 py-2.5 text-sm font-black shadow-lg transition-transform hover:scale-105 bg-emerald-600 text-white border-none">
                    {latestData.zenFlex.couleurJourJ}
                  </Badge>
                )}
                {latestData?.zenFlex?.couleurJourJ1 && (
                  <Badge variant="outline" className="px-6 py-2.5 text-sm font-black border-2 shadow-sm transition-transform hover:scale-105 border-rose-500 text-rose-400 bg-rose-500/10">
                    {latestData.zenFlex.couleurJourJ1}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="flex items-center gap-3 px-5 py-3 bg-card border-border shadow-md">
                  <CloudSun className="w-5 h-5 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Prévision du jour</span>
                    <span className="font-black text-xs">{latestData?.solCast?.today ?? 0} kWh</span>
                  </div>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-3 px-5 py-3 bg-card border-border border-dashed shadow-sm">
                  <CloudSun className="w-5 h-5 text-orange-300 opacity-70" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Demain</span>
                    <span className="font-black text-xs">{latestData?.solCast?.tomorrow ?? 0} kWh</span>
                  </div>
                </Badge>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Réseau Electrique" 
                value={gridPower} 
                unit="W" 
                icon={Zap} 
                showSeparator={true}
                detailsLayout="side"
                valueExtra={
                  <Badge variant="outline" className="text-[10px] font-black uppercase px-2 py-0 border-primary/30 text-primary">
                    {latestData?.grid?.sens ?? "Achat"}
                  </Badge>
                }
              />
              <MetricCard 
                title="Production Solaire" 
                value={solarProduction} 
                unit="W" 
                icon={Sun} 
                showSeparator={true}
                detailsLayout="side"
                details={[
                  { label: "SolarEdge", value: latestData?.production?.detail?.solarEdge ?? 0, unit: "W" },
                  { label: "ApSystems", value: latestData?.production?.detail?.apSystems ?? 0, unit: "W" }
                ]}
              />
              <MetricCard 
                title="Batterie" 
                titleExtra={
                  <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black uppercase px-2 py-0.5 ml-2">
                    {latestData?.battery?.stateLabel || (batteryPower > 0 ? "En charge" : "En décharge")}
                  </Badge>
                }
                value={batterySoc} 
                unit="%" 
                icon={BatteryIcon} 
                showSeparator={true}
                detailsLayout="side"
                details={[
                  { label: "Puissance", value: Math.abs(batteryPower), unit: "W" },
                  { label: "Tension", value: latestData?.battery?.voltage ?? 0, unit: "V" }
                ]}
              />
              <MetricCard 
                title="Consommation" 
                value={houseConsumption} 
                unit="W" 
                icon={Activity} 
                showSeparator={true}
                detailsLayout="side"
                details={[
                  { label: "Maison", value: houseMain, unit: "W" },
                  { label: "Annexe", value: houseAnnexe, unit: "W" }
                ]}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-border bg-card shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Répartition Énergie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                        <span className="flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Maison Principale</span>
                        <span className="text-primary">{houseMain} W</span>
                      </div>
                      <Progress value={(houseMain / (houseConsumption || 1)) * 100} className="h-3 bg-secondary/50" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-accent" /> Annexe</span>
                        <span className="text-accent">{houseAnnexe} W</span>
                      </div>
                      <Progress value={(houseAnnexe / (houseConsumption || 1)) * 100} className="h-3 bg-secondary/50" />
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
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Maison</p>
                            <p className="text-sm font-black">{latestData?.chauffeEau?.maison ?? 0} <span className="text-[9px] font-normal">W</span></p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Annexe</p>
                            <p className="text-sm font-black">{latestData?.chauffeEau?.annexe ?? 0} <span className="text-[9px] font-normal">W</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-secondary/20 rounded-2xl border border-border">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3">Eau Totale</p>
                        <p className="text-2xl font-black flex items-center gap-2 mb-4">
                          <Droplets className="w-5 h-5 text-blue-400" />
                          {latestData?.eau?.total ?? 0} <span className="text-sm font-medium text-muted-foreground">m³</span>
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Maison</p>
                            <p className="text-sm font-black">{latestData?.eau?.maison ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Annexe</p>
                            <p className="text-sm font-black">{latestData?.eau?.annexe ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Compteur</p>
                            <p className="text-sm font-black">{latestData?.eau?.compteur ?? 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-8">
                {vehicles.length > 0 && (
                  <div className="relative">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-1">Flotte Véhicules</h3>
                    <Carousel className="w-full">
                      <CarouselContent>
                        {vehicles.map(([id, car]) => {
                          const isCharging = car.charge === true;
                          
                          return (
                            <CarouselItem key={id}>
                              <Card className="border-border shadow-xl overflow-hidden bg-gradient-to-br from-card to-background relative">
                                {isCharging && (
                                  <Badge className="absolute top-4 right-4 bg-emerald-600 hover:bg-emerald-600 text-white border-none text-[9px] font-black uppercase px-2 py-0.5 animate-pulse z-10">
                                    En charge
                                  </Badge>
                                )}
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-black flex items-center gap-2">
                                      <Car className="w-4 h-4 text-primary" />
                                      {car.carModel || car.display_name}
                                    </CardTitle>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-2">
                                  <div className="flex flex-col mb-4">
                                    <p className={cn("text-4xl font-black tracking-tighter mb-2", isCharging ? "text-emerald-500" : "")}>
                                      {car.batteryLevel ?? car.battery_level ?? 0}%
                                    </p>
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                        Autonomie: {Math.round(car.range ?? car.est_battery_range_km ?? 0)} km
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                        Kilomètre: {mounted ? Math.round(car.odometer ?? 0).toLocaleString() : Math.round(car.odometer ?? 0)} km
                                      </p>
                                    </div>
                                  </div>
                                  <Progress 
                                    value={car.batteryLevel ?? car.battery_level ?? 0} 
                                    className={cn("h-2.5 bg-primary/10", isCharging ? "[&>div]:bg-emerald-500" : "")} 
                                  />
                                </CardContent>
                              </Card>
                            </CarouselItem>
                          );
                        })}
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
          </>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-left duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Résumé Journalier
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                        {mounted ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ""}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={refreshHistory}
                      className="h-8 w-8 rounded-full hover:bg-secondary"
                      title="Rafraîchir l'historique"
                    >
                      <RefreshCw className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
              </div>
              
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard 
                    title="Production journalière" 
                    value={historyData?.Production ?? 0} 
                    unit="kWh" 
                    icon={Sun} 
                    detailsLayout="bottom"
                    details={[
                      { label: "SolarEdge", value: historyData?.SolarEdge ?? 0, unit: "kWh" },
                      { label: "ApSystems", value: historyData?.Ecu ?? 0, unit: "kWh" }
                    ]}
                  />

                  <MetricCard 
                    title="Utilisation" 
                    value={historyData?.Production ?? 0} 
                    unit="kWh" 
                    icon={PieChart} 
                    detailsLayout="bottom"
                    details={[
                      { label: "Auto-Conso.", value: historyData?.AutoConsommation ?? 0, unit: "kWh" },
                      { label: "Vente", value: historyData?.Vente ?? 0, unit: "kWh" }
                    ]}
                  />

                  <MetricCard 
                    title="Consommation journalière" 
                    value={historyData?.Consommation ?? 0} 
                    unit="kWh" 
                    icon={Activity} 
                    detailsLayout="bottom"
                    details={[
                      { label: "Auto-Production", value: historyData?.AutoConsommation ?? 0, unit: "kWh" },
                      { label: "Achat", value: historyData?.Achat ?? 0, unit: "kWh" }
                    ]}
                  />
              </section>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <CalendarDays className="w-6 h-6 text-accent" />
                  Résumé Total
              </h2>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard 
                    title="Production totale" 
                    value={totalHistoryData?.production ?? 0} 
                    unit="kWh" 
                    icon={Sun} 
                    detailsLayout="bottom"
                    details={[
                      { label: "SolarEdge", value: ((totalHistoryData?.production ?? 0) - (totalHistoryData?.apSystems ?? 0)).toFixed(2), unit: "kWh" },
                      { label: "ApSystems", value: totalHistoryData?.apSystems ?? 0, unit: "kWh" }
                    ]}
                  />

                  <MetricCard 
                    title="Utilisation totale" 
                    value={totalHistoryData?.production ?? 0} 
                    unit="kWh" 
                    icon={PieChart} 
                    detailsLayout="bottom"
                    details={[
                      { label: "Auto-Conso.", value: totalHistoryData?.autoConsommation ?? 0, unit: "kWh" },
                      { label: "Vente", value: totalHistoryData?.vente ?? 0, unit: "kWh" }
                    ]}
                  />

                  <MetricCard 
                    title="Consommation totale" 
                    value={totalHistoryData?.consommation ?? 0} 
                    unit="kWh" 
                    icon={Activity} 
                    detailsLayout="bottom"
                    details={[
                      { label: "Auto-Production", value: totalHistoryData?.autoConsommation ?? 0, unit: "kWh" },
                      { label: "Achat", value: totalHistoryData?.achat ?? 0, unit: "kWh" }
                    ]}
                  />
              </section>
            </div>

            <SolarHistoryChart 
              data={solarChartData} 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onRefresh={refreshHistory}
            />

            <SolarForecastChart data={solCastChartData} />
            <DailyHistoryTable data={dailyHistoryData} />
            <AnnualSummaryTable data={annualData} />
          </div>
        )}
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
