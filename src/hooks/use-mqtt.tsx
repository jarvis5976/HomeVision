
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

export interface HistoryData {
  Production: number;
  SolarEdge: number;
  Ecu: number;
  Achat: number;
  Vente: number;
  Consommation: number;
  AutoConsommation: number;
}

export interface TotalHistoryData {
  production: number;
  achat: number;
  vente: number;
  consommation: number;
  autoConsommation: number;
  apSystems: number;
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
  historyData: HistoryData | null;
  totalHistoryData: TotalHistoryData | null;
  error: string | null;
  refreshAll: () => Promise<void>;
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
      batteryLevel: 0,
      odometer: 0,
      range: 0,
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

const BASE_HISTORY_MOCK: HistoryData = {
  Production: 12.45,
  SolarEdge: 5.62,
  Ecu: 6.83,
  Achat: 33.24,
  Vente: 2.07,
  Consommation: 43.62,
  AutoConsommation: 10.38
};

const BASE_TOTAL_HISTORY_MOCK: TotalHistoryData = {
  production: 4567.80,
  achat: 2130.45,
  vente: 890.22,
  consommation: 5808.03,
  autoConsommation: 3677.58,
  apSystems: 1245.30
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulated, setIsSimulated] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [historyData, setHistoryData] = useState<HistoryData | null>(BASE_HISTORY_MOCK);
  const [totalHistoryData, setTotalHistoryData] = useState<TotalHistoryData | null>(BASE_TOTAL_HISTORY_MOCK);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchRealData = useCallback(async () => {
    try {
      // On utilise le proxy interne pour éviter les erreurs CORS
      const proxyUrl = (target: string) => `/api/proxy?url=${encodeURIComponent(target)}`;

      const [instantRes, historyRes, queryRes] = await Promise.all([
        fetch(proxyUrl('http://192.168.0.3/Dashboard/assets/instant_from_mqtt.php'), { signal: AbortSignal.timeout(5000) }),
        fetch(proxyUrl('http://192.168.0.3/Dashboard/assets/Solaire/getProductDays.php'), { signal: AbortSignal.timeout(5000) }),
        fetch(proxyUrl('http://192.168.0.3/Dashboard/assets/Solaire/getProduct_query.php'), { signal: AbortSignal.timeout(5000) })
      ]);
      
      if (!instantRes.ok || !historyRes.ok || !queryRes.ok) throw new Error(`Proxy error!`);
      
      const instantData = await instantRes.json();
      const histData = await historyRes.json();
      const productQuery = await queryRes.json();
      
      if (instantData.error) throw new Error(instantData.error);
      if (histData.error) throw new Error(histData.error);
      if (productQuery.error) throw new Error(productQuery.error);

      const adaptedData = { ...instantData };
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
      setHistoryData(histData);

      if (productQuery.data && productQuery.data.total) {
        setTotalHistoryData({
          production: parseFloat(productQuery.data.total[1]?.data || 0),
          achat: parseFloat(productQuery.data.total[2]?.data || 0),
          vente: parseFloat(productQuery.data.total[3]?.data || 0),
          consommation: parseFloat(productQuery.data.total[4]?.data || 0),
          autoConsommation: parseFloat(productQuery.data.total[5]?.data || 0),
          apSystems: parseFloat(productQuery.data.total[6]?.data || productQuery.data.total[6] || 0)
        });
      }

      setError(null);
    } catch (e: any) {
      console.error('Fetch error:', e);
      setError(e.message || "Impossible de contacter l'endpoint local via le proxy.");
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
    setHistoryData(prev => {
        if (!prev) return BASE_HISTORY_MOCK;
        return {
            ...prev,
            Production: Number((prev.Production + 0.01).toFixed(2)),
            Consommation: Number((prev.Consommation + 0.02).toFixed(2))
        };
    });
    setTotalHistoryData(prev => {
        if (!prev) return BASE_TOTAL_HISTORY_MOCK;
        return {
            ...prev,
            production: Number((prev.production + 0.1).toFixed(2)),
            consommation: Number((prev.consommation + 0.15).toFixed(2))
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
    <MQTTContext.Provider value={{ isSimulated, setIsSimulated, messages, latestData, historyData, totalHistoryData, error, refreshAll: fetchRealData }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
