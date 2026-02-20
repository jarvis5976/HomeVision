
"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import mqtt, { MqttClient } from 'mqtt';

interface MQTTMessage {
  topic: string;
  message: string;
  timestamp: Date;
}

interface MQTTContextType {
  connected: boolean;
  messages: MQTTMessage[];
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
  const [topics, setTopics] = useState<string[]>(['home/sensors/+', 'home/status/gate', 'home/livingroom/temp']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reverting to ws:// as requested. 
    // NOTE: This will trigger a SecurityError in browsers if the page is HTTPS.
    // Browsers require WSS (Secure WebSockets) for HTTPS pages.
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
        setMessages(prev => [
          { topic, message: payload.toString(), timestamp: new Date() },
          ...prev.slice(0, 49)
        ]);
      });

      mqttClient.on('close', () => setConnected(false));
      
      mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err);
        setError(err.message || "Connection error. Check browser console.");
      });

      setClient(mqttClient);
    } catch (e: any) {
      // Catch synchronous security errors (like HTTPS blocking WS)
      console.error('MQTT Initialization Error:', e);
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
    if (!topics.includes(topic)) {
      setTopics([...topics, topic]);
    }
  };

  const removeTopic = (topic: string) => {
    if (client && connected) client.unsubscribe(topic);
    setTopics(topics.filter(t => t !== topic));
  };

  const publish = (topic: string, message: string) => {
    if (client && connected) {
      client.publish(topic, message);
    }
  };

  return (
    <MQTTContext.Provider value={{ connected, messages, topics, addTopic, removeTopic, publish, error }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
