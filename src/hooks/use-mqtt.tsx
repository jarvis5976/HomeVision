
"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';

export interface CarData {
  batteryLevel?: number;
  battery_level?: number;
  odometer?: number;
  range?: number;
  est_battery_range_km?: number;
  states?: number | string;
  chargeStatus?: string;
  charging_state?: string;
  carModel?: string;
  display_name?: string;
  model?: string;
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
  Couleur?: string;
  Production_SolarEdge: number;
  Production_Ecu: number;
  Production_Total: number;
  Vente: number;
  Achat: number;
  Consommation: number;
  Autoconsommation: number;
  BatteryCharge: number;
  BatteryDischarge: number;
  BatteryTotal: number;
  HP: number;
  HC: number;
  ConsommationMaison: number;
  ConsommationAnnexe: number;
  Prevision: number;
  Borne: number;
  SunHours: number;
  AchatMaison: number;
  AchatAnnexe: number;
}

export interface DailyHistoryData {
  unGroup: {
    byKwh: DailyHistoryItem[];
    byPourc: DailyHistoryItem[];
  };
  group: {
    byKwh: DailyHistoryItem[];
    byPourc: DailyHistoryItem[];
  };
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
  solarChartData: SolarChartData | null;
  solCastChartData: SolCastChartData | null;
  annualData: AnnualData | null;
  dailyHistoryData: DailyHistoryData | null;
  error: string | null;
  refreshAll: () => Promise<void>;
  fetchHistoryStats: () => Promise<void>;
  fetchSolarChart: (start: string, end: string) => Promise<void>;
  fetchSolCastChart: () => Promise<void>;
  fetchAnnualData: () => Promise<void>;
  fetchDailyHistory: () => Promise<void>;
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

const BASE_MOCK_DATA: HomeDashboardData = {
  compteurEdf: { isousc: 60, conso_base: 102752909 },
  eau: { total: 1127.65, maison: 796.81, annexe: 330.84, compteur: 1214.91 },
  grid: { watts: 7301, sens: "Achat", arrow: "" },
  production: { 
    total: 32,
    detail: { solarEdge: 0, apSystems: 32, apsAnnexe: 32 }
  },
  battery: { 
    watts: 2647, 
    soc: 83, 
    temperature: 20.2, 
    voltage: 50.63, 
    stateLabel: "En charge",
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
      battery_level: 81,
      est_battery_range_km: 424.3,
      odometer: 63401.93,
      charging_state: "Complete",
      display_name: "E-Ty",
      model: "Y"
    },
    volvo: {
      carModel: "Volvo XC40",
      batteryLevel: 59,
      odometer: 38316,
      range: 230,
      chargeStatus: "En charge"
    },
    zoe: {
      carModel: "Renault Zoé",
      batteryLevel: 97,
      odometer: 51571,
      range: 313,
      chargeStatus: "Pas en charge"
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

const SOLAR_CHART_MOCK: SolarChartData = {
  multi: {
    Label: ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"],
    Achat: [1.96,5.57,5.17,6,5.63,2.19,2.82,3.68,0.08,0.05,0.06,0.03,0.01,0.01,0.01,0.02,0.05,0.1,0.5,1.2,1.8,2.2,2.5,2.1],
    Vente: [0,0,0,0,0,0,0,0,-0.02,-0.02,-0.02,-0.01,-0.1,-0.5,-0.8,-0.4,-0.2,0,0,0,0,0,0,0],
    AutoConsommation: [0,0,0,0,0,0,0,0.01,0,0.08,0.21,0.18,0.5,1.2,1.5,1.1,0.8,0.4,0,0,0,0,0,0],
    Production: [0,0,0,0,0,0,0,0.01,0.02,0.1,0.23,0.19,0.8,1.8,2.5,1.8,1.2,0.6,0.1,0,0,0,0,0],
    BatterieCharge: [0,0,0,0,0,0,-1.52,-2.38,0,0,0,0,-0.5,-1.2,-0.8,0,0,0,0,0,0,0,0,0],
    BatterieDecharge: [0,0,0,0,0,0,0,0,0.25,0.26,0.26,0.16,0,0,0,0.2,0.5,0.8,1.2,1.5,1.0,0.5,0.2,0.1],
    BatterieSoc: [76,76,76,76,76,76,81,90,84,79,75,73,70,68,65,63,60,58,55,52,50,48,45,42],
    Estimation: [0,0,0,0,0,0,0,0,0.02,0.34,0.64,0.9,1.5,2.2,2.8,2.2,1.6,0.8,0.2,0,0,0,0,0],
    TotalHC: 33.02,
    TotalHP: 0.22
  }
};

const SOLCAST_CHART_MOCK: SolCastChartData = [
  { "Label": ["07:46","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","18:17"] },
  { "Energy": [0,0.02,0.34,0.64,0.9,1.08,1.17,1.17,1.06,0.85,0.55,0.25,0.02] },
  { "Energy": [0,0.03,0.35,0.65,0.91,1.09,1.18,1.18,1.07,0.86,0.56,0.29,0.03] }
];

const ANNUAL_DATA_MOCK: AnnualData = {
  production: [
    { "mois": "TOTAL", "2023": 4534.9, "2024": 4466.79, "2025": 5582.11, "2026": 250.32 },
    { "mois": "Janvier", "2023": 107.41, "2024": 124.04, "2025": 90.82, "2026": 109.76 },
    { "mois": "Février", "2023": 120.5, "2024": 130.2, "2025": 110.4, "2026": 140.56 }
  ],
  achat: [],
  vente: [],
  autoConsommation: []
};

const DAILY_HISTORY_MOCK: DailyHistoryData = {
  unGroup: { byKwh: [], byPourc: [] },
  group: { byKwh: [], byPourc: [] }
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulated, setIsSimulated] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [historyData, setHistoryData] = useState<HistoryData | null>(BASE_HISTORY_MOCK);
  const [totalHistoryData, setTotalHistoryData] = useState<TotalHistoryData | null>(BASE_TOTAL_HISTORY_MOCK);
  const [solarChartData, setSolarChartData] = useState<SolarChartData | null>(SOLAR_CHART_MOCK);
  const [solCastChartData, setSolCastChartData] = useState<SolCastChartData | null>(SOLCAST_CHART_MOCK);
  const [annualData, setAnnualData] = useState<AnnualData | null>(ANNUAL_DATA_MOCK);
  const [dailyHistoryData, setDailyHistoryData] = useState<DailyHistoryData | null>(DAILY_HISTORY_MOCK);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchRealData = useCallback(async () => {
    if (isSimulated) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const targetUrl = 'http://192.168.0.3/Dashboard/assets/instant_from_mqtt.php';
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
      const instantRes = await fetch(proxyUrl, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      if (!instantRes.ok) throw new Error(`Proxy error!`);
      const instantData = await instantRes.json();
      
      const adaptedData = { ...instantData };
      if (adaptedData.voiture) {
        Object.keys(adaptedData.voiture).forEach(key => {
          const car = adaptedData.voiture[key];
          car.batteryLevel = car.batteryLevel ?? car.battery_level;
          car.carModel = car.carModel ?? (car.model ? `Model ${car.model}` : undefined);
          car.range = car.range ?? car.est_battery_range_km;
          car.chargeStatus = car.chargeStatus ?? car.charging_state ?? car.charge;
        });
      }
      setLatestData(adaptedData);
      setError(null);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.warn('Fetch timed out');
      } else {
        console.error('Fetch error:', e);
        setError(e.message || "Erreur de connexion");
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }, [isSimulated]);

  const fetchHistoryStats = useCallback(async () => {
    if (isSimulated) {
      setHistoryData(BASE_HISTORY_MOCK);
      setTotalHistoryData(BASE_TOTAL_HISTORY_MOCK);
      return;
    }
    try {
      const proxyUrl = (target: string) => `/api/proxy?url=${encodeURIComponent(target)}`;
      const historyRes = await fetch(proxyUrl('http://192.168.0.3/Dashboard/assets/Solaire/getProductDays.php'));
      const queryRes = await fetch(proxyUrl('http://192.168.0.3/Dashboard/assets/Solaire/getProduct_query.php'));
      
      if (historyRes.ok && queryRes.ok) {
        const histData = await historyRes.json();
        const productQuery = await queryRes.json();
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
      }
    } catch (e) {
      console.error('History Stats Error:', e);
    }
  }, [isSimulated]);

  const fetchSolarChart = useCallback(async (start: string, end: string) => {
    if (isSimulated) {
      setSolarChartData(SOLAR_CHART_MOCK);
      return;
    }
    try {
      const url = `http://192.168.0.3/Dashboard/assets/Solaire/getSolaire.php?startDate=${start}&endDate=${end}`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setSolarChartData(data);
      }
    } catch (e) {
      console.error('Solar Chart Error:', e);
    }
  }, [isSimulated]);

  const fetchSolCastChart = useCallback(async () => {
    if (isSimulated) {
      setSolCastChartData(SOLCAST_CHART_MOCK);
      return;
    }
    try {
      const url = `http://192.168.0.3/Dashboard/assets/Solaire/getSolCast.php`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setSolCastChartData(data);
      }
    } catch (e) {
      console.error('SolCast Chart Error:', e);
    }
  }, [isSimulated]);

  const fetchAnnualData = useCallback(async () => {
    if (isSimulated) {
      setAnnualData(ANNUAL_DATA_MOCK);
      return;
    }
    try {
      const url = `http://192.168.0.3/Dashboard/assets/Solaire/getStatByMonths.php`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setAnnualData(data);
      }
    } catch (e) {
      console.error('Annual Data Error:', e);
    }
  }, [isSimulated]);

  const fetchDailyHistory = useCallback(async () => {
    if (isSimulated) {
      setDailyHistoryData(DAILY_HISTORY_MOCK);
      return;
    }
    try {
      const url = `http://192.168.0.3/Dashboard/assets/Solaire/listeProductDays2.php`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setDailyHistoryData(data);
      }
    } catch (e) {
      console.error('Daily History Error:', e);
    }
  }, [isSimulated]);

  const runSimulation = useCallback(() => {
    setLatestData(prev => {
      if (!prev) return BASE_MOCK_DATA;
      const fluctuate = (val: number, range: number = 10) => val + (Math.random() * range - range/2);
      const updatedVoiture = { ...prev.voiture };
      Object.keys(updatedVoiture).forEach(key => {
        const car = updatedVoiture[key];
        updatedVoiture[key] = {
          ...car,
          batteryLevel: Math.round(Math.max(0, Math.min(100, fluctuate(car.batteryLevel || car.battery_level || 50, 0.5)))),
          battery_level: Math.round(Math.max(0, Math.min(100, fluctuate(car.battery_level || car.batteryLevel || 50, 0.5)))),
          odometer: (car.odometer || 0) + 0.01,
          range: Math.round(Math.max(0, fluctuate(car.range || car.est_battery_range_km || 300, 2))),
          est_battery_range_km: Math.round(Math.max(0, fluctuate(car.est_battery_range_km || car.range || 300, 2)))
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
    <MQTTContext.Provider value={{ 
      isSimulated, 
      setIsSimulated, 
      messages, 
      latestData, 
      historyData, 
      totalHistoryData, 
      solarChartData,
      solCastChartData,
      annualData,
      dailyHistoryData,
      error, 
      refreshAll: fetchRealData,
      fetchHistoryStats,
      fetchSolarChart,
      fetchSolCastChart,
      fetchAnnualData,
      fetchDailyHistory
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
