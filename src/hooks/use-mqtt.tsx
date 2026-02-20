
"use client";

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
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
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [topics, setTopics] = useState<string[]>(['home/sensors/+', 'home/status/gate', 'home/livingroom/temp']);

  useEffect(() => {
    // Attempting to connect to the broker specified in the requirements.
    // Note: For browser usage, the broker must support WebSockets on this address.
    // Using a fallback for local dev if 192.168.0.3 is not reachable.
    const brokerUrl = 'ws://192.168.0.3:1885'; // Assuming WS protocol for browser compatibility
    
    const mqttClient = mqtt.connect(brokerUrl, {
      connectTimeout: 5000,
      reconnectPeriod: 1000,
      // In a real environment, you might need authentication
    });

    mqttClient.on('connect', () => {
      setConnected(true);
      topics.forEach(t => mqttClient.subscribe(t));
    });

    mqttClient.on('message', (topic, payload) => {
      setMessages(prev => [
        { topic, message: payload.toString(), timestamp: new Date() },
        ...prev.slice(0, 49) // Keep last 50 messages
      ]);
    });

    mqttClient.on('close', () => setConnected(false));
    mqttClient.on('error', (err) => console.error('MQTT Error:', err));

    setClient(mqttClient);

    return () => {
      mqttClient.end();
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
    <MQTTContext.Provider value={{ connected, messages, topics, addTopic, removeTopic, publish }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) throw new Error('useMQTT must be used within MQTTProvider');
  return context;
};
