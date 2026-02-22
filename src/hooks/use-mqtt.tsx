
"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';

export interface CarData {
  batteryLevel?: number;
  odometer?: number;
  range?: number;
  states?: number | string;
  chargeStatus?: string;
  carModel?: string;
  display_name?: string;
  [key: string]: any;
}

export interface HomeDashboardData {
  compteurEdf?: { conso_base: number; isousc: number };
  eau?: { total: number; maison: number; annexe: number; compteur: number };
  grid?: { watts: number; sens: string; arrow: string };
  production?: { total: number; detail: any };
  battery?: { watts: number; soc: number; stateLabel: string; voltage: number; temperature: number; state: number };
  victron?: { batteryTitle: string; EssState: any };
  voiture?: Record<string, CarData>;
  energy?: { total: { all: number; maison: number; annexe: number }; detail: any };
  zenFlex?: { couleurJourJ: string; couleurJourJ1: string; contratColor: string };
  solCast?: { today: number; tomorrow: number };
  chauffeEau?: { total: number; maison: number; annexe: number };
  borne?: { watts: number; total: number };
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
  eau: { total: 1127.65, maison: 796.81, annexe: 330.84, compteur: 1214.91 },
  grid: { watts: 7301, sens: "Achat", arrow: "dist/img/Arrow_Right_to_Left_R.svg" },
  production: { 
    total: 32,
    detail: { solarEdge: 0, apSystems: 32, apsAnnexe: 32 }
  },
  battery: { 
    watts: 2647, 
    soc: 83, 
    temperature: 20.2, 
    voltage: 50.63, 
    stateLabel: "charging",
    state: 1
  },
  victron: {
    batteryTitle: "En charge",
    EssState: { label: "Optimized mode w/o BatteryLife" }
  },
  energy: { 
    total: { all: 4686, maison: 3365, annexe: 1289 },
    detail: {
      maison: { cumulus: 1253, chauffage: 1466 },
      annexe: { cumulus: 2.2, chauffage: 1010.9 }
    }
  },
  chauffeEau: { total: 1255.2, maison: 1253, annexe: 2.2 },
  voiture: {
    tesla: {
      carModel: "Tesla Model Y",
      batteryLevel: 70,
      range: 343,
      odometer: 51439,
      chargeStatus: "Pas en charge",
      display_name: "E-Ty"
    },
    volvo: {
      carModel: "Volvo XC40",
      batteryLevel: 45,
      odometer: 12400,
      range: 180,
      chargeStatus: "Pas en charge",
      display_name: "Volvo"
    },
    zoe: {
      carModel: "Renault Zoe",
      batteryLevel: 100,
      odometer: 51503,
      range: 311,
      chargeStatus: "Pas en charge",
      display_name: "Zoe"
    }
  },
  zenFlex: {
    contratColor: "bg-success",
    couleurJourJ: "Aujourd'hui : jour Eco",
    couleurJourJ1: "Demain : jour Sobriété"
  },
  solCast: { today: 8.75, tomorrow: 8.03 }
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulated, setIsSimulated] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchRealData = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.0.3/Dashboard/assets/instant_from_mqtt.php', {
        signal: AbortSignal.timeout(3000),
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const adaptedData = { ...data };
      if (adaptedData.voiture) {
        Object.keys(adaptedData.voiture).forEach(key => {
          const car = adaptedData.voiture[key];
          car.batteryLevel = car.batteryLevel ?? car.battery_level;
          car.carModel = car.carModel ?? (car.model ? `Model ${car.model}` : undefined);
          car.range = car.range ?? car.est_battery_range_km;
          car.chargeStatus = car.chargeStatus ?? car.charging_state;
        });
      }

      setLatestData(adaptedData);
      setError(null);
      
      setMessages(prev => [
        { topic: 'api/poll', message: 'Data updated from endpoint', timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
    } catch (e: any) {
      setError(e.message || "Failed to fetch from local endpoint.");
    }
  }, []);

  const runSimulation = useCallback(() => {
    setLatestData(prev => {
      if (!prev) return BASE_MOCK_DATA;
      const fluctuate = (val: number, range: number = 10) => val + (Math.random() * range - range/2);
      
      const updatedVoiture = { ...prev.voiture };
      Object.keys(updatedVoiture).forEach(key => {
        const car = updatedVoiture[key];
        updatedVoiture[key] = {
          ...car,
          batteryLevel: Math.round(Math.max(0, Math.min(100, fluctuate(car.batteryLevel || 50, 0.5)))),
          odometer: (car.odometer || 0) + 0.01,
          range: Math.round(Math.max(0, fluctuate(car.range || 300, 2)))
        };
      });

      return {
        ...prev,
        grid: { ...prev.grid, watts: Math.round(fluctuate(prev.grid?.watts || 7300, 150)) } as any,
        production: { ...prev.production, total: Math.round(Math.max(0, fluctuate(prev.production?.total || 32, 5))) } as any,
        battery: { 
          ...prev.battery, 
          watts: Math.round(fluctuate(prev.battery?.watts || 2600, 50)),
          soc: Math.max(0, Math.min(100, Math.round(fluctuate(prev.battery?.soc || 83, 0.5))))
        } as any,
        energy: {
          total: {
            all: Math.round(fluctuate(prev.energy?.total.all || 4600, 100)),
            maison: Math.round(fluctuate(prev.energy?.total.maison || 3300, 80)),
            annexe: Math.round(fluctuate(prev.energy?.total.annexe || 1200, 40)),
          }
        } as any,
        voiture: updatedVoiture
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
    <MQTTContext.Provider value={{ isSimulated, setIsSimulated, messages, latestData, error, refreshData: fetchRealData }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
