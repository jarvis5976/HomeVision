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
  productionSolaredgeTotal?: number;
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

export type SolarPowerChartData = [
  { Label: string[] },
  ...Array<{ name: string; data: number[] }>
];

export type SolCastChartData = [
  { Label: string[] },
  { Energy: number[] },
  { Energy: number[] }
];

export interface AnnualData {
  production: AnnualMetricItem[];
  achat: AnnualMetricItem[];
  vente: AnnualMetricItem[];
  autoConsommation: AnnualMetricItem[];
}

export interface AnnualMetricItem {
  mois: string;
  [year: string]: number | string;
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
  production?: { total: number; detail: any; percentageProduction?: number };
  battery?: { 
    watts: number; 
    soc: number; 
    stateLabel: string; 
    voltage: number; 
    state: number; 
    nextTimeCharge?: string;
    batteryTimeLeft?: string;
  };
  victron?: { nextBatteryChargePourc: number };
  voiture?: Record<string, CarData>;
  energy?: { 
    total: { 
      all: number; 
      maison: number; 
      annexe: number;
      achat?: number;
      vente?: number;
      production?: number;
    }; 
    detail: any 
  };
  zenFlex?: { 
    couleurJourJ?: string; 
    couleurJourJ1?: string; 
    couleurJourJLight?: string; 
    couleurJourJ1Light?: string; 
    countSobriete?: number;
    periode?: string; 
    totalHP?: number; 
    totalHC?: number 
  };
  solCast?: { today: number; tomorrow: number };
  chauffeEau?: { total: number; maison: number; annexe: number; cumulusActif?: boolean; cumulusDouche?: number };
  eau?: { total: number; compteur?: number; maison?: number; annexe?: number };
  totalStart?: {
    productionTotal: number;
    achatTotal: number;
    venteTotal: number;
    consoTotal: number;
    autoConsoTotal: number;
    productionApsTotal: number;
    productionSolaredgeTotal: number;
  };
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
  solarPowerChartData: SolarPowerChartData | null;
  solCastChartData: SolCastChartData | null;
  annualData: AnnualData | null;
  dailyHistoryData: DailyHistoryData | null;
  error: string | null;
  fetchHistoryStats: () => Promise<void>;
  fetchSolarChart: (date: string) => Promise<void>;
  fetchSolarPowerChart: (date: string) => Promise<void>;
  fetchSolCastChart: () => Promise<void>;
  fetchAnnualData: () => Promise<void>;
  fetchDailyHistory: () => Promise<void>;
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

const BASE_MOCK_DATA: HomeDashboardData = {
  grid: { watts: 7301, sens: "Achat", arrow: "" },
  production: { total: 32, detail: { solarEdge: 0, apSystems: 32 }, percentageProduction: 85 },
  battery: { 
    watts: 2647, 
    soc: 83, 
    stateLabel: "Décharge", 
    voltage: 50.63, 
    state: 1, 
    nextTimeCharge: "22:00",
    batteryTimeLeft: "2h 45min"
  },
  victron: { nextBatteryChargePourc: 90 },
  energy: { 
    total: { 
      all: 4686, 
      maison: 3365, 
      annexe: 1289,
      achat: 24.52,
      vente: 1.18,
      production: 7.2
    }, 
    detail: {} 
  },
  chauffeEau: { maison: 0, annexe: 1190.9, total: 1190.9, cumulusDouche: 0, cumulusActif: false },
  eau: { total: 1130.5, compteur: 1217.76, maison: 798.63, annexe: 331.88 },
  voiture: {
    "tesla": {
      "batteryLevel": 54,
      "odometer": 64148,
      "range": 262,
      "charge": false,
      "carModel": "Tesla Model Y",
      "localisation": "not_home"
    },
    "volvo": {
      "batteryLevel": 59,
      "odometer": 38316,
      "range": 230,
      "charge": true,
      "charger_time_charging_minutes": 45,
      "carModel": "Volvo XC40",
      "localisation": "home"
    }
  },
  zenFlex: { 
    couleurJourJLight: "Eco",
    couleurJourJ1Light: "Sobriété",
    countSobriete: 12,
    periode: "HP", 
    totalHP: 12.5, 
    totalHC: 8.2 
  },
  solCast: { today: 8.75, tomorrow: 8.03 },
  totalStart: {
    productionTotal: 22552.7,
    achatTotal: 94204.51,
    venteTotal: 2814.01,
    consoTotal: 113943.2,
    autoConsoTotal: 113943.2,
    productionApsTotal: 9381.39,
    productionSolaredgeTotal: 13171.31
  }
};

const MOCK_POWER_CHART_DATA: SolarPowerChartData = [
  { "Label": ["18/03 00:00","00:10","00:20","00:30","00:40","00:50","01:00","01:10","01:20","01:30","01:40","01:50","02:00","02:10","02:20","02:30","02:40","02:50","03:00","03:10","03:20","03:30","03:40","03:50","04:00","04:10","04:20","04:30","04:40","04:50","05:00","05:10","05:20","05:30","05:40","05:50","06:00","06:10","06:20","06:30","06:40","06:50","07:00","07:10","07:20","07:30","07:40","07:50","08:00","08:10","08:20","08:30"] },
  { "name": "SolarEdge", "data": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,49,61,69,76,82,93] },
  { "name": "APsystems", "data": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,60,79,86,93,81,91,106,142] }
];

const MOCK_TOTAL_HISTORY: TotalHistoryData = {
  production: 22552.7,
  achat: 94204.51,
  vente: 2814.01,
  consommation: 113943.2,
  autoConsommation: 113943.2,
  apSystems: 9381.39
};

const MOCK_DAILY_HISTORY: HistoryData = {
  Production: 7.2,
  SolarEdge: 4.8,
  Ecu: 2.4,
  Achat: 24.5,
  Vente: 1.2,
  Consommation: 30.5,
  AutoConsommation: 6.0
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulated, setIsSimulated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [totalHistoryData, setTotalHistoryData] = useState<TotalHistoryData | null>(null);
  const [solarChartData, setSolarChartData] = useState<SolarChartData | null>(null);
  const [solarPowerChartData, setSolarPowerChartData] = useState<SolarPowerChartData | null>(null);
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
      const data: HomeDashboardData = await res.json();
      setLatestData(data);
      
      // Update historical totals from totalStart if present
      if (data.totalStart) {
        setTotalHistoryData({
          production: data.totalStart.productionTotal,
          achat: data.totalStart.achatTotal,
          vente: data.totalStart.venteTotal,
          consommation: data.totalStart.consoTotal,
          autoConsommation: data.totalStart.autoConsoTotal,
          apSystems: data.totalStart.productionApsTotal,
          productionSolaredgeTotal: data.totalStart.productionSolaredgeTotal
        });
      }
      
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

  const fetchSolarPowerChart = useCallback(async (date: string) => {
    if (isSimulated) {
      setSolarPowerChartData(MOCK_POWER_CHART_DATA);
      return;
    }
    try {
      const url = `http://192.168.0.3/Dashboard/assets/Solaire/getProductDays_Quart.php`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      if (res.ok) setSolarPowerChartData(await res.json());
    } catch (e) { console.error(e); }
  }, [isSimulated]);

  const fetchHistoryStats = useCallback(async () => {
    if (isSimulated) {
      setHistoryData(MOCK_DAILY_HISTORY);
      setTotalHistoryData(MOCK_TOTAL_HISTORY);
      return;
    }
    try {
      const proxy = (u: string) => `/api/proxy?url=${encodeURIComponent(u)}`;
      const hRes = await fetch(proxy('http://192.168.0.3/Dashboard/assets/Solaire/getProductDays.php'));
      if (hRes.ok) {
        const hData = await hRes.json();
        setHistoryData(hData);
      }
    } catch (e) { console.error('Error fetching history stats:', e); }
  }, [isSimulated]);

  const fetchSolCastChart = useCallback(async () => { if (!isSimulated) { const res = await fetch(`/api/proxy?url=${encodeURIComponent('http://192.168.0.3/Dashboard/assets/Solaire/getSolCast.php')}`); if (res.ok) setSolCastChartData(await res.json()); } }, [isSimulated]);
  const fetchAnnualData = useCallback(async () => { if (!isSimulated) { const res = await fetch(`/api/proxy?url=${encodeURIComponent('http://192.168.0.3/Dashboard/assets/Solaire/getStatByMonths.php')}`); if (res.ok) setAnnualData(await res.json()); } }, [isSimulated]);
  const fetchDailyHistory = useCallback(async () => { if (!isSimulated) { const res = await fetch(`/api/proxy?url=${encodeURIComponent('http://192.168.0.3/Dashboard/assets/Solaire/listeProductDays2.php')}`); if (res.ok) setDailyHistoryData(await res.json()); } }, [isSimulated]);

  useEffect(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (!isPaused) {
      if (isSimulated) {
        setHistoryData(MOCK_DAILY_HISTORY);
        setTotalHistoryData(MOCK_TOTAL_HISTORY);
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
      historyData, totalHistoryData, solarChartData, solarPowerChartData, solCastChartData, annualData, dailyHistoryData, error,
      fetchHistoryStats, fetchSolarChart, fetchSolarPowerChart, fetchSolCastChart, fetchAnnualData, fetchDailyHistory
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
