"use client";

import Link from "next/link";
import { LayoutDashboard, Settings, Activity, Home, AlertCircle, PlayCircle, Radio } from "lucide-react";
import { useMQTT } from "@/hooks/use-mqtt";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Sidebar() {
  const { isSimulated, setIsSimulated, error } = useMQTT();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/", active: true },
    { name: "Devices", icon: Home, href: "#" },
    { name: "Analytics", icon: Activity, href: "#" },
    { name: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col hidden md:flex sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">HomeVision</h1>
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
        {/* Mode Toggle */}
        <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="mode-toggle" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">
              {isSimulated ? "Simulation" : "Real Data"}
            </Label>
            <Switch 
              id="mode-toggle" 
              checked={!isSimulated} 
              onCheckedChange={(val) => setIsSimulated(!val)}
            />
          </div>
          <div className="flex items-center gap-2">
            {isSimulated ? (
              <PlayCircle className="w-3 h-3 text-accent" />
            ) : (
              <Radio className="w-3 h-3 text-primary animate-pulse" />
            )}
            <span className="text-[10px] text-muted-foreground leading-none">
              {isSimulated ? "Demo data mode" : "Polling 192.168.0.3"}
            </span>
          </div>
        </div>
        
        {error && !isSimulated && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-destructive uppercase">Network Error</p>
              <p className="text-[10px] text-destructive/80 leading-tight mt-1">
                Local endpoint blocked? Check Mixed Content rules.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
