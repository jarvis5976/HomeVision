
"use client";

import Link from "next/link";
import { LayoutDashboard, Settings, Activity, Shield, Home, AlertCircle, PlayCircle } from "lucide-react";
import { useMQTT } from "@/hooks/use-mqtt";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { connected, error, isSimulated } = useMQTT();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/", active: true },
    { name: "Devices", icon: Home, href: "#" },
    { name: "Analytics", icon: Activity, href: "#" },
    { name: "Security", icon: Shield, href: "#" },
    { name: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col hidden md:flex sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">HomeSense</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                item.active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border space-y-4">
        {isSimulated && (
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl flex gap-2 items-start">
            <PlayCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-accent uppercase">Simulation Mode</p>
              <p className="text-[10px] text-accent/80 leading-tight mt-1">Showing generated data for preview.</p>
            </div>
          </div>
        )}
        
        {error && !connected && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-destructive uppercase">Connection Issue</p>
              <p className="text-[10px] text-destructive/80 leading-tight mt-1 truncate">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Broker Connection</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium truncate max-w-[100px]">192.168.0.3</span>
            <StatusBadge status={connected ? 'online' : 'offline'} />
          </div>
        </div>
      </div>
    </div>
  );
}
