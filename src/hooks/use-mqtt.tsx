
"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';

export interface HomeDashboardData {
  compteurEdf?: { conso_base: number; isousc: number };
  eau?: { total: number; maison: number; annexe: number };
  grid?: { watts: number; sens: string };
  production?: { total: number; detail: any };
  battery?: { watts: number; soc: number; stateLabel: string; voltage: number; temperature: number };
  voiture?: { tesla: any };
  energy?: { total: { all: number; maison: number; annexe: number }; detail: any };
  zenFlex?: { couleurJourJ: string; couleurJourJ1: string; contratColor: string };
  solCast?: { today: number; tomorrow: number };
  chauffeEau?: { total: number };
}

interface MQTTMessage {
  topic: string;
  message: string;
  timestamp: Date;
}

interface MQTTContextType {
  isSimulated: boolean;
  setIsSimulated: (val: boolean) => void;
  messages: MQTTMessage[];
  latestData: HomeDashboardData | null;
  error: string | null;
  refreshData: () => Promise<void>;
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

const BASE_MOCK_DATA: HomeDashboardData = {
  compteurEdf: { isousc: 60, conso_base: 102752909 },
  eau: { total: 1127.65, maison: 796.81, annexe: 330.84 },
  grid: { watts: 3365, sens: "Achat" },
  production: { total: 32 },
  battery: { watts: 2647, soc: 83, temperature: 20.2, voltage: 50.63, stateLabel: "charging" },
  energy: { total: { all: 4686, maison: 3365, annexe: 1289 } },
  chauffeEau: { total: 1255.2 },
  voiture: {
    tesla: {
      battery_level: 80,
      est_battery_range_km: 425.17,
      inside_temp: 12,
      odometer: 63294.17,
      charging_state: "Complete",
      plugged_in: true,
      model: "Y"
    }
  },
  zenFlex: {
    contratColor: "bg-success",
    couleurJourJ: "Aujourd'hui : jour Eco",
    couleurJourJ1: "Demain : jour Eco"
  },
  solCast: { today: 8.75, tomorrow: 8.03 }
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulated, setIsSimulated] = useState(true);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchRealData = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.0.3/Dashboard/assets/instant_from_mqtt.php', {
        // Adding a short timeout and cache settings to avoid hanging on blockages
        signal: AbortSignal.timeout(3000)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setLatestData(data);
      setError(null);
      
      setMessages(prev => [
        { topic: 'api/poll', message: 'Data updated from endpoint', timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
    } catch (e: any) {
      // Don't log to console.error to avoid spamming the developer overlay
      const errorMessage = e.name === 'TypeError' 
        ? "Network error: Connection refused or Mixed Content block (HTTP on HTTPS)."
        : e.message || "Failed to fetch from local endpoint.";
      setError(errorMessage);
    }
  }, []);

  const runSimulation = useCallback(() => {
    setLatestData(prev => {
      if (!prev) return BASE_MOCK_DATA;
      const fluctuate = (val: number, range: number = 10) => val + (Math.random() * range - range/2);
      return {
        ...prev,
        grid: { ...prev.grid, watts: Math.round(fluctuate(prev.grid?.watts || 3000, 100)) } as any,
        production: { ...prev.production, total: Math.round(fluctuate(prev.production?.total || 30, 5)) } as any,
        battery: { 
          ...prev.battery, 
          watts: Math.round(fluctuate(prev.battery?.watts || 2600, 50)),
          soc: Math.max(0, Math.min(100, Math.round(fluctuate(prev.battery?.soc || 83, 1))))
        } as any,
        energy: {
          total: {
            all: Math.round(fluctuate(prev.energy?.total.all || 4600, 100)),
            maison: Math.round(fluctuate(prev.energy?.total.maison || 3300, 80)),
            annexe: Math.round(fluctuate(prev.energy?.total.annexe || 1200, 40)),
          }
        } as any,
        voiture: {
          tesla: {
            ...prev.voiture?.tesla,
            battery_level: Math.round(fluctuate(prev.voiture?.tesla?.battery_level || 80, 0.5)),
            inside_temp: Math.round(fluctuate(prev.voiture?.tesla?.inside_temp || 12, 1)),
          }
        } as any
      };
    });
  }, []);

  useEffect(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    if (isSimulated) {
      pollInterval.current = setInterval(runSimulation, 3000);
    } else {
      fetchRealData(); 
      pollInterval.current = setInterval(fetchRealData, 5000);
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [isSimulated, fetchRealData, runSimulation]);

  return (
    <MQTTContext.Provider value={{ 
      isSimulated, 
      setIsSimulated, 
      messages, 
      latestData, 
      error,
      refreshData: fetchRealData 
    }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
