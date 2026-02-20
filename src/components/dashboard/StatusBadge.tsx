
"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'alert';
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const colors = {
    online: "bg-accent text-accent-foreground",
    offline: "bg-muted text-muted-foreground",
    alert: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", colors[status], className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
        status === 'online' ? "bg-accent-foreground" : 
        status === 'offline' ? "bg-muted-foreground" : "bg-white"
      )} />
      {label || status}
    </div>
  );
}
