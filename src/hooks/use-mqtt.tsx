
"use client";

import { useState, useEffect, createContext, useContext, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

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
  connected: boolean;
  isSimulated: boolean;
  messages: MQTTMessage[];
  latestData: HomeDashboardData | null;
  topics: string[];
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  publish: (topic: string, message: string) => void;
  error: string | null;
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
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(BASE_MOCK_DATA);
  const [topics, setTopics] = useState<string[]>(['home/dashboard/data', 'home/sensors/#']);
  const [error, setError] = useState<string | null>(null);
  
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const brokerUrl = 'ws://192.168.0.3:1885'; 
    let mqttClient: MqttClient | null = null;

    try {
      mqttClient = mqtt.connect(brokerUrl, {
        connectTimeout: 5000,
        reconnectPeriod: 1000,
        rejectUnauthorized: false,
      });

      mqttClient.on('connect', () => {
        setConnected(true);
        setIsSimulated(false);
        setError(null);
        if (simulationInterval.current) {
          clearInterval(simulationInterval.current);
          simulationInterval.current = null;
        }
        topics.forEach(t => mqttClient?.subscribe(t));
      });

      mqttClient.on('message', (topic, payload) => {
        const msgStr = payload.toString();
        if (topic === 'home/dashboard/data') {
          try {
            const parsed = JSON.parse(msgStr);
            setLatestData(parsed);
          } catch (e) {
            console.error("Failed to parse dashboard data", e);
          }
        }
        setMessages(prev => [
          { topic, message: msgStr, timestamp: new Date() },
          ...prev.slice(0, 49)
        ]);
      });

      mqttClient.on('close', () => {
        setConnected(false);
        // If connection closes and stays closed, start simulation for UI demo
        if (!isSimulated) startSimulation();
      });
      
      mqttClient.on('error', (err) => {
        setError(err.message);
        startSimulation();
      });

      setClient(mqttClient);
    } catch (e: any) {
      setError("Browser Security: WS connections often require WSS. Falling back to simulation.");
      startSimulation();
    }

    function startSimulation() {
      if (simulationInterval.current) return;
      setIsSimulated(true);
      
      simulationInterval.current = setInterval(() => {
        setLatestData(prev => {
          if (!prev) return BASE_MOCK_DATA;
          
          // Helper to slightly fluctuate values for visual feedback
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
      }, 3000);
    }

    return () => {
      mqttClient?.end();
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, []);

  useEffect(() => {
    if (client && connected) {
      topics.forEach(t => client.subscribe(t));
    }
  }, [topics, client, connected]);

  const addTopic = (topic: string) => {
    if (!topics.includes(topic)) setTopics([...topics, topic]);
  };

  const removeTopic = (topic: string) => {
    if (client && connected) client.unsubscribe(topic);
    setTopics(topics.filter(t => t !== topic));
  };

  const publish = (topic: string, message: string) => {
    if (client && connected) client.publish(topic, message);
  };

  return (
    <MQTTContext.Provider value={{ connected, isSimulated, messages, latestData, topics, addTopic, removeTopic, publish, error }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
