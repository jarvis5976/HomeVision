"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';

export interface CarData {
  batteryLevel?: number;
  battery_level?: number;
  odometer?: number;
  range?: number;
  est_battery_range_km?: number;
  charge?: boolean;
  carModel?: string;
  display_name?: string;
  charger_time_charging_minutes?: number;
  localisation?: string;
  location?: {
    name?: string;
    address?: string;
    [key: string]: any;
  } | string;
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

export interface SolarChartData {
  multi: {
    Label: string[];
    Achat: number[];
    Vente: number[];
    AutoConsommation: number[];
    Production: number[];
    BatterieCharge: number[];
    BatterieDecharge: number[];
    Estimation: number[];
    BatterieSoc: number[];
    TotalHC: number;
    TotalHP: number;
  };
}

export type SolCastChartData = [
  { Label: string[] },
  { Energy: number[] },
  { Energy: number[] }
];

export interface AnnualMetricItem {
  mois: string;
  [year: string]: number | string;
}

export interface AnnualData {
  production: AnnualMetricItem[];
  achat: AnnualMetricItem[];
  vente: AnnualMetricItem[];
  autoConsommation: AnnualMetricItem[];
}

export interface DailyHistoryItem {
  Année: number;
  Date: string;
  Production_Total: number;
  Vente: number;
  Achat: number;
  Consommation: number;
  Autoconsommation: number;
  [key: string]: any;
}

export interface DailyHistoryData {
  unGroup: { byKwh: DailyHistoryItem[]; byPourc: DailyHistoryItem[]; };
  group: { byKwh: DailyHistoryItem[]; byPourc: DailyHistoryItem[]; };
}

export interface HomeDashboardData {
  grid?: { watts: number; sens: string; arrow: string };
  production?: { total: number; detail: any };
  battery?: { watts: number; soc: number; stateLabel: string; voltage: number; state: number };
  voiture?: Record<string, CarData>;
  energy?: { total: { all: number; maison: number; annexe: number }; detail: any };
  zenFlex?: { couleurJourJ: string; couleurJourJ1: string };
  solCast?: { today: number; tomorrow: number };
  chauffeEau?: { total: number; maison: number; annexe: number };
}

interface MQTTContextType {
  isSimulated: boolean;
  setIsSimulated: (val: boolean) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  latestData: HomeDashboardData | null;
  historyData: HistoryData | null;
  totalHistoryData: TotalHistoryData | null;
  solarChartData: SolarChartData | null;
  solCastChartData: SolCastChartData | null;
  annualData: AnnualData | null;
  dailyHistoryData: DailyHistoryData | null;
  error: string | null;
  fetchHistoryStats: () => Promise<void>;
  fetchSolarChart: (date: string) => Promise<void>;
  fetchSolCastChart: () => Promise<void>;
  fetchAnnualData: () => Promise<void>;
  fetchDailyHistory: () => Promise<void>;
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

const BASE_MOCK_DATA: HomeDashboardData = {
  grid: { watts: 7301, sens: "Achat", arrow: "" },
  production: { total: 32, detail: { solarEdge: 0, apSystems: 32 } },
  battery: { watts: 2647, soc: 83, stateLabel: "En charge", voltage: 50.63, state: 1 },
  energy: { total: { all: 4686, maison: 3365, annexe: 1289 }, detail: {} },
  chauffeEau: { total: 1255.2, maison: 1253, annexe: 2.2 },
  voiture: {
    "tesla": {
      "batteryLevel": 54,
      "odometer": 64148,
      "range": 262,
      "charge": false,
      "carModel": "Tesla Model Y",
      "charger_time_charging_minutes": 0,
      "localisation": "not_home"
    },
    "volvo": {
      "batteryLevel": 59,
      "odometer": 38316,
      "range": 230,
      "charge": false,
      "carModel": "Volvo XC40",
      "localisation": "home"
    },
    "zoe": {
      "batteryLevel": 76,
      "odometer": 51687,
      "range": 242,
      "charge": true,
      "carModel": "Renault Zoé",
      "charger_time_charging_minutes": 65,
      "localisation": "home"
    }
  },
  zenFlex: { couleurJourJ: "jour Eco", couleurJourJ1: "jour Sobriété" },
  solCast: { today: 8.75, tomorrow: 8.03 }
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulated, setIsSimulated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [totalHistoryData, setTotalHistoryData] = useState<TotalHistoryData | null>(null);
  const [solarChartData, setSolarChartData] = useState<SolarChartData | null>(null);
  const [solCastChartData, setSolCastChartData] = useState<SolCastChartData | null>(null);
  const [annualData, setAnnualData] = useState<AnnualData | null>(null);
  const [dailyHistoryData, setDailyHistoryData] = useState<DailyHistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchRealData = useCallback(async () => {
    if (isSimulated || isPaused) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const targetUrl = 'http://192.168.0.3/Dashboard/assets/instant_from_mqtt.php';
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`Proxy error!`);
      const data = await res.json();
      setLatestData(data);
      setError(null);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      clearTimeout(timeoutId);
    }
  }, [isSimulated, isPaused]);

  const fetchSolarChart = useCallback(async (date: string) => {
    if (isSimulated) return;
    try {
      const url = `http://192.168.0.3/Dashboard/assets/Solaire/getSolaire.php`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      if (res.ok) setSolarChartData(await res.json());
    } catch (e) { console.error(e); }
  }, [isSimulated]);

  const fetchHistoryStats = useCallback(async () => {
    if (isSimulated) return;
    try {
      const proxy = (u: string) => `/api/proxy?url=${encodeURIComponent(u)}`;
      const hRes = await fetch(proxy('http://192.168.0.3/Dashboard/assets/Solaire/getProductDays.php'));
      const qRes = await fetch(proxy('http://192.168.0.3/Dashboard/assets/Solaire/getProduct_query.php'));
      if (hRes.ok) setHistoryData(await hRes.json());
      if (qRes.ok) {
        const q = await qRes.json();
        if (q.data?.total) {
          setTotalHistoryData({
            production: parseFloat(q.data.total[1]?.data || 0),
            achat: parseFloat(q.data.total[2]?.data || 0),
            vente: parseFloat(q.data.total[3]?.data || 0),
            consommation: parseFloat(q.data.total[4]?.data || 0),
            autoConsommation: parseFloat(q.data.total[5]?.data || 0),
            apSystems: parseFloat(q.data.total[6]?.data || 0)
          });
        }
      }
    } catch (e) { console.error(e); }
  }, [isSimulated]);

  const fetchSolCastChart = useCallback(async () => { if (!isSimulated) { const res = await fetch(`/api/proxy?url=${encodeURIComponent('http://192.168.0.3/Dashboard/assets/Solaire/getSolCast.php')}`); if (res.ok) setSolCastChartData(await res.json()); } }, [isSimulated]);
  const fetchAnnualData = useCallback(async () => { if (!isSimulated) { const res = await fetch(`/api/proxy?url=${encodeURIComponent('http://192.168.0.3/Dashboard/assets/Solaire/getStatByMonths.php')}`); if (res.ok) setAnnualData(await res.json()); } }, [isSimulated]);
  const fetchDailyHistory = useCallback(async () => { if (!isSimulated) { const res = await fetch(`/api/proxy?url=${encodeURIComponent('http://192.168.0.3/Dashboard/assets/Solaire/listeProductDays2.php')}`); if (res.ok) setDailyHistoryData(await res.json()); } }, [isSimulated]);

  useEffect(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (!isPaused) {
      if (isSimulated) {
        pollInterval.current = setInterval(() => {
          setLatestData(prev => {
            if (!prev) return BASE_MOCK_DATA;
            return { ...prev, grid: { ...prev.grid, watts: (prev.grid?.watts || 7000) + Math.round(Math.random() * 20 - 10) } as any };
          });
        }, 3000);
      } else {
        fetchRealData();
        pollInterval.current = setInterval(fetchRealData, 5000);
      }
    }
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [isSimulated, isPaused, fetchRealData]);

  return (
    <MQTTContext.Provider value={{ 
      isSimulated, setIsSimulated, isPaused, setIsPaused, latestData, 
      historyData, totalHistoryData, solarChartData, solCastChartData, annualData, dailyHistoryData, error,
      fetchHistoryStats, fetchSolarChart, fetchSolCastChart, fetchAnnualData, fetchDailyHistory
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