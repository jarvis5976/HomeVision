
"use client";

import { MQTTProvider, useMQTT } from "@/hooks/use-mqtt";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SensorChart } from "@/components/dashboard/SensorChart";
import { TopicManager } from "@/components/dashboard/TopicManager";
import { AnomalyAlerter } from "@/components/dashboard/AnomalyAlerter";
import { Thermometer, Droplets, Zap, Lock, Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const { messages } = useMQTT();

  // Mock data derivation from MQTT messages or static for visualization
  const getLatestValue = (topicPart: string) => {
    const msg = messages.find(m => m.topic.includes(topicPart));
    return msg ? msg.message : "24.5"; // Fallback mock
  };

  const chartData = [
    { time: "00:00", value: 22 },
    { time: "04:00", value: 21 },
    { time: "08:00", value: 23 },
    { time: "12:00", value: 26 },
    { time: "16:00", value: 25 },
    { time: "20:00", value: 24 },
    { time: "23:59", value: 23.5 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search devices or sensors..." 
                className="pl-9 bg-secondary border-none h-9 text-sm focus-visible:ring-1"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </Button>
            <div className="h-8 w-px bg-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Home Admin</p>
                <p className="text-[10px] text-muted-foreground mt-1">Primary Manager</p>
              </div>
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Home Overview</h2>
                <p className="text-sm text-muted-foreground">Real-time monitoring from your MQTT broker</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Temperature" 
                value={getLatestValue('temp')} 
                unit="°C" 
                icon={Thermometer} 
                trend={1.2} 
              />
              <MetricCard 
                title="Humidity" 
                value={getLatestValue('humidity') || "42"} 
                unit="%" 
                icon={Droplets} 
                trend={-0.5} 
              />
              <MetricCard 
                title="Power Usage" 
                value="2.4" 
                unit="kW" 
                icon={Zap} 
                trend={15} 
                status="alert"
              />
              <MetricCard 
                title="Gate Lock" 
                value="Secure" 
                icon={Lock} 
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <SensorChart title="Ambient Temperature (24h)" data={chartData} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TopicManager />
                <AnomalyAlerter />
              </div>
            </div>

            <aside className="space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="text-base font-bold mb-4">Live Activity</h3>
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.slice(0, 6).map((msg, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-secondary transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{msg.topic}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-10 text-muted-foreground italic">
                      Waiting for incoming MQTT messages...
                    </p>
                  )}
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-lg">
                <img 
                  src="https://picsum.photos/seed/smarthome-sidebar/400/300" 
                  alt="Home Status" 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                  <p className="text-white font-bold">System Integrity</p>
                  <p className="text-white/70 text-xs">All components operational</p>
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
