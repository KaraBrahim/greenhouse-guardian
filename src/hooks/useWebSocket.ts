import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, defaultSensorData } from '@/types/sensor';

const WS_URL = 'ws://13.221.104.81:8000/ws/sensors/esp32_device';

export function useWebSocket() {
  const [sensorData, setSensorData] = useState<SensorData>(defaultSensorData);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: SensorData = JSON.parse(event.data);
          console.log('Received sensor data:', data);
          setSensorData(data);
          setDataHistory(prev => [...prev.slice(-59), data]); // Keep last 60 readings
        } catch (error) {
          console.error('Error parsing sensor data:', error);
        }
      };

      ws.onclose = () => {
        console.log('Connection closed');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sensorData,
    isConnected,
    connectionStatus,
    dataHistory,
    connect,
    disconnect,
  };
}
