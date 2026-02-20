
"use client";

import { useState, useEffect, createContext, useContext } from 'react';
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
  messages: MQTTMessage[];
  latestData: HomeDashboardData | null;
  topics: string[];
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  publish: (topic: string, message: string) => void;
  error: string | null;
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [latestData, setLatestData] = useState<HomeDashboardData | null>(null);
  const [topics, setTopics] = useState<string[]>(['home/dashboard/data', 'home/sensors/#']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Note: ws:// is used as requested. 
    // If the browser blocks this on an HTTPS page, it will trigger a SecurityError.
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
        setError(null);
        topics.forEach(t => mqttClient?.subscribe(t));
      });

      mqttClient.on('message', (topic, payload) => {
        const msgStr = payload.toString();
        
        // Handle nested data objects if received on the main topic
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

      mqttClient.on('close', () => setConnected(false));
      
      mqttClient.on('error', (err) => {
        setError(err.message);
      });

      setClient(mqttClient);
    } catch (e: any) {
      setError("Security Block: Browsers require WSS on HTTPS sites.");
    }

    return () => {
      mqttClient?.end();
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
    <MQTTContext.Provider value={{ connected, messages, latestData, topics, addTopic, removeTopic, publish, error }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
