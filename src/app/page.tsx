
"use client";

import { useState, useEffect, useCallback } from "react";
import { MQTTProvider, useMQTT } from "@/hooks/use-mqtt";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SolarHistoryChart } from "@/components/dashboard/SolarHistoryChart";
import { SolarForecastChart } from "@/components/dashboard/SolarForecastChart";
import { AnnualSummaryTable } from "@/components/dashboard/AnnualSummaryTable";
import { DailyHistoryTable } from "@/components/dashboard/DailyHistoryTable";
import { 
  Zap, Battery as BatteryIcon, Car, Droplets, Sun, Home, History, Flame, ArrowLeft, TrendingUp, PieChart, Activity, Clock, MapPin, CloudSun, Moon, SunMedium
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ViewType = 'dashboard' | 'history';

function DashboardContent() {
  const { 
    latestData, historyData, solarChartData, solCastChartData, annualData, dailyHistoryData, isSimulated, setIsSimulated, setIsPaused, fetchHistoryStats, fetchSolarChart, fetchSolCastChart, fetchAnnualData, fetchDailyHistory
  } = useMQTT();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
    const initialTheme = localStorage.getItem('homevision-theme') as 'light' | 'dark' || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  useEffect(() => { setIsPaused(view === 'history'); }, [view, setIsPaused]);

  const refreshHistory = useCallback(() => {
    fetchHistoryStats();
    fetchSolarChart(selectedDate);
    fetchSolCastChart();
    fetchAnnualData();
    fetchDailyHistory();
  }, [fetchHistoryStats, fetchSolarChart, fetchSolCastChart, fetchAnnualData, fetchDailyHistory, selectedDate]);

  useEffect(() => { if (view === 'history') refreshHistory(); }, [view, refreshHistory]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('homevision-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const formatTime = (mins: number | undefined) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="h-20 border-b border-border flex items-center justify-between px-8 sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Home className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase">HomeVision</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant={view === 'history' ? "secondary" : "outline"} size="sm" onClick={() => setView(view === 'history' ? 'dashboard' : 'history')} className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
            {view === 'history' ? <ArrowLeft className="w-4 h-4" /> : <History className="w-4 h-4" />}
            {view === 'history' ? "Tableau de Bord" : "Historique"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-10 h-10">
            {theme === 'dark' ? <SunMedium className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-primary" />}
          </Button>
          <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-xl border border-border">
            <Switch id="mode" checked={!isSimulated} onCheckedChange={v => setIsSimulated(!v)} />
            <Label htmlFor="mode" className="text-[10px] font-black uppercase cursor-pointer">{isSimulated ? "Simulation" : "Réel"}</Label>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-up duration-500">
        {view === 'dashboard' ? (
          <>
            <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
              <div className="flex gap-4">
                {latestData?.zenFlex?.couleurJourJ && <Badge className="px-6 py-2.5 text-sm font-black bg-emerald-600 text-white border-none">{latestData.zenFlex.couleurJourJ}</Badge>}
                {latestData?.zenFlex?.couleurJourJ1 && <Badge variant="outline" className="px-6 py-2.5 text-sm font-black border-2 border-rose-500 text-rose-400 bg-rose-500/10">{latestData.zenFlex.couleurJourJ1}</Badge>}
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="flex items-center gap-3 px-5 py-3 bg-card border-border"><CloudSun className="w-5 h-5 text-orange-400" /><div className="flex flex-col"><span className="text-[9px] font-black uppercase">Prévision jour</span><span className="font-black text-xs">{latestData?.solCast?.today ?? 0} kWh</span></div></Badge>
                <Badge variant="outline" className="flex items-center gap-3 px-5 py-3 bg-card border-border border-dashed opacity-70"><CloudSun className="w-5 h-5 text-orange-300" /><div className="flex flex-col"><span className="text-[9px] font-black uppercase">Demain</span><span className="font-black text-xs">{latestData?.solCast?.tomorrow ?? 0} kWh</span></div></Badge>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Réseau Electrique" value={latestData?.grid?.watts ?? 0} unit="W" icon={Zap} valueExtra={<Badge variant="outline" className="text-[10px] font-black uppercase px-2 py-0 border-primary/30 text-primary">{latestData?.grid?.sens ?? "Achat"}</Badge>} />
              <MetricCard 
                title="Production Solaire" 
                titleExtra={latestData?.production?.percentageProduction !== undefined && (
                  <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black uppercase px-2 py-0.5 ml-2">
                    {latestData.production.percentageProduction}%
                  </Badge>
                )}
                value={latestData?.production?.total ?? 0} 
                unit="W" 
                icon={Sun} 
                detailsLayout="side" 
                details={[{ label: "SolarEdge", value: latestData?.production?.detail?.solarEdge ?? 0, unit: "W" }, { label: "ApSystems", value: latestData?.production?.detail?.apSystems ?? 0, unit: "W" }]} 
              />
              <MetricCard title="Batterie" value={latestData?.battery?.soc ?? 0} unit="%" icon={BatteryIcon} titleExtra={<Badge className="bg-emerald-600 text-white border-none text-[9px] font-black uppercase px-2 py-0.5 ml-2">{latestData?.battery?.stateLabel}</Badge>} detailsLayout="side" details={[{ label: "Puissance", value: Math.abs(latestData?.battery?.watts ?? 0), unit: "W" }, { label: "Tension", value: latestData?.battery?.voltage ?? 0, unit: "V" }]} />
              <MetricCard title="Consommation" value={latestData?.energy?.total?.all ?? 0} unit="W" icon={Activity} detailsLayout="side" details={[{ label: "Maison", value: latestData?.energy?.total?.maison ?? 0, unit: "W" }, { label: "Annexe", value: latestData?.energy?.total?.annexe ?? 0, unit: "W" }]} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-border bg-card shadow-lg">
                  <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Répartition Énergie</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3"><div className="flex justify-between text-xs font-black uppercase"><span>Maison Principale</span><span>{latestData?.energy?.total?.maison ?? 0} W</span></div><Progress value={((latestData?.energy?.total?.maison ?? 0) / (latestData?.energy?.total?.all || 1)) * 100} className="h-3" /></div>
                    <div className="space-y-3"><div className="flex justify-between text-xs font-black uppercase"><span>Annexe</span><span>{latestData?.energy?.total?.annexe ?? 0} W</span></div><Progress value={((latestData?.energy?.total?.annexe ?? 0) / (latestData?.energy?.total?.all || 1)) * 100} className="h-3" /></div>
                    <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 bg-secondary/20 rounded-2xl border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[10px] text-muted-foreground uppercase font-black">Chauffe-eau</p>
                          {latestData?.chauffeEau?.cumulusActif !== undefined && (
                            <Badge variant={latestData.chauffeEau.cumulusActif ? "default" : "secondary"} className={cn("text-[8px] font-black uppercase px-2 py-0 h-4 border-none", latestData.chauffeEau.cumulusActif ? "bg-emerald-600 text-white" : "bg-secondary/40 text-muted-foreground")}>
                              {latestData.chauffeEau.cumulusActif ? "Actif" : "Inactif"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-black flex items-center gap-2 mb-2">
                          <Flame className={cn("w-5 h-5", latestData?.chauffeEau?.cumulusActif ? "text-orange-500" : "text-muted-foreground")} />
                          {latestData?.chauffeEau?.total ?? 0} W
                        </p>
                        {latestData?.chauffeEau?.cumulusDouche !== undefined && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{latestData.chauffeEau.cumulusDouche} Douches</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-secondary/20 rounded-2xl border border-border"><p className="text-[10px] text-muted-foreground uppercase font-black mb-3">Eau Totale</p><p className="text-2xl font-black flex items-center gap-2 mb-4"><Droplets className="w-5 h-5 text-blue-400" />{latestData?.eau?.total ?? 0} m³</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-8">
                {latestData?.voiture && Object.entries(latestData.voiture).length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase text-muted-foreground mb-4 px-1">Flotte Véhicules</h3>
                    <Carousel className="w-full relative group">
                      <CarouselContent>
                        {Object.entries(latestData.voiture).map(([id, car]) => {
                          const isCharging = car.charge === true;
                          const locStr = (car.localisation || (typeof car.location === 'object' ? car.location.name : car.location) || "").toString().toLowerCase();
                          const isHome = locStr === 'home' || locStr === 'maison';
                          return (
                            <CarouselItem key={id}>
                              <Card className="border-border shadow-xl overflow-hidden bg-gradient-to-br from-card to-background relative h-full">
                                <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
                                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-border text-[9px] font-black uppercase px-2 py-0.5 flex items-center gap-1 shadow-sm">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    {isHome ? "Maison" : "Absent"}
                                  </Badge>
                                  {isCharging && <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black uppercase px-2 py-0.5 animate-pulse shadow-sm">En charge</Badge>}
                                  {isCharging && car.charger_time_charging_minutes && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
                                      <Clock className="w-3 h-3 text-emerald-500" />
                                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{formatTime(car.charger_time_charging_minutes)}</span>
                                    </div>
                                  )}
                                </div>
                                <CardHeader className="pb-2"><CardTitle className="text-base font-black flex items-center gap-2"><Car className="w-4 h-4 text-primary" />{car.carModel || car.display_name}</CardTitle></CardHeader>
                                <CardContent className="p-6 pt-2">
                                  <p className={cn("text-4xl font-black tracking-tighter mb-2", isCharging ? "text-emerald-500" : "")}>{car.batteryLevel ?? car.battery_level ?? 0}%</p>
                                  <div className="space-y-1 mb-4">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Autonomie: {Math.round(car.range ?? car.est_battery_range_km ?? 0)} km</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Kilomètre: {mounted ? Math.round(car.odometer ?? 0).toLocaleString() : 0} km</p>
                                  </div>
                                  <Progress value={car.batteryLevel ?? car.battery_level ?? 0} className={cn("h-2.5", isCharging ? "[&>div]:bg-emerald-500" : "")} />
                                </CardContent>
                              </Card>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>
                      <div className="flex justify-center gap-4 mt-4">
                        <CarouselPrevious className="static translate-y-0" />
                        <CarouselNext className="static translate-y-0" />
                      </div>
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
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><TrendingUp className="w-6 h-6 text-primary" /> Résumé Journalier</h2>
                <Badge variant="secondary" className="px-4 py-1.5 font-black uppercase text-[10px]">{mounted ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ""}</Badge>
              </div>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Production journalière" value={historyData?.Production ?? 0} unit="kWh" icon={Sun} detailsLayout="bottom" details={[{ label: "SolarEdge", value: historyData?.SolarEdge ?? 0, unit: "kWh" }, { label: "ApSystems", value: historyData?.Ecu ?? 0, unit: "kWh" }]} />
                <MetricCard title="Utilisation" value={historyData?.Production ?? 0} unit="kWh" icon={PieChart} detailsLayout="bottom" details={[{ label: "Auto-Conso.", value: historyData?.AutoConsommation ?? 0, unit: "kWh" }, { label: "Vente", value: historyData?.Vente ?? 0, unit: "kWh" }]} />
                <MetricCard title="Consommation journalière" value={historyData?.Consommation ?? 0} unit="kWh" icon={Activity} detailsLayout="bottom" details={[{ label: "Auto-Production", value: historyData?.AutoConsommation ?? 0, unit: "kWh" }, { label: "Achat", value: historyData?.Achat ?? 0, unit: "kWh" }]} />
              </section>
            </div>
            <SolarHistoryChart data={solarChartData} date={selectedDate} onDateChange={setSelectedDate} onRefresh={refreshHistory} />
            <SolarForecastChart data={solCastChartData} />
            <DailyHistoryTable data={dailyHistoryData} />
            <AnnualSummaryTable data={annualData} />
          </div>
        )}
      </main>
      <footer className="py-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] border-t border-border/50 mt-12">HomeVision Dashboard &copy; {mounted ? new Date().getFullYear() : ""}</footer>
    </div>
  );
}

export default function HomePage() { return ( <MQTTProvider><DashboardContent /></MQTTProvider> ); }
