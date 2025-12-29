import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, defaultSensorData } from '@/types/sensor';
import { logInfo, logSuccess, logWarning, logError } from '@/types/logs';

const WS_URL = 'ws://13.221.104.81:8000/ws/sensors/esp32_device';

export function useWebSocket() {
  const [sensorData, setSensorData] = useState<SensorData>(defaultSensorData);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCountRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logWarning('websocket', 'Connection attempt ignored - already connected');
      return;
    }

    logInfo('websocket', 'Initiating WebSocket connection...', WS_URL);
    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      logInfo('websocket', 'WebSocket instance created, waiting for connection...');

      ws.onopen = () => {
        logSuccess('websocket', 'Successfully connected to sensor server');
        setIsConnected(true);
        setConnectionStatus('connected');
        messageCountRef.current = 0;
        logInfo('system', 'System ready to receive sensor data');
      };

      ws.onmessage = (event) => {
        try {
          const data: SensorData = JSON.parse(event.data);
          messageCountRef.current++;
          
          logInfo('sensor', `Data received (#${messageCountRef.current})`, 
            `Temp: ${data.temp}°C, Hum: ${data.hum}%, Gas: ${data.gas}ppm`);
          
          // Log status changes
          if (data.system_health === 'critical') {
            logError('sensor', 'CRITICAL: System health is critical!', JSON.stringify(data.alerts));
          } else if (data.system_health === 'attention') {
            logWarning('sensor', 'System requires attention', JSON.stringify(data.alerts));
          }
          
          // Log individual sensor alerts
          if (data.temp_status === 'hot') {
            logWarning('sensor', 'High temperature alert', `${data.temp}°C`);
          }
          if (data.temp_status === 'cold') {
            logInfo('sensor', 'Low temperature detected', `${data.temp}°C`);
          }
          if (data.air_quality === 'poor' || data.air_quality === 'hazardous') {
            logError('sensor', 'Air quality alert', data.air_quality);
          }
          if (data.motion_status === 'detected') {
            logWarning('sensor', 'Motion detected in greenhouse');
          }
          if (data.gas_alarm_status !== 'clear') {
            logError('sensor', 'Gas alarm triggered!', data.gas_alarm_status);
          }
          
          setSensorData(data);
          setDataHistory(prev => {
            const newHistory = [...prev.slice(-59), data];
            if (newHistory.length % 10 === 0) {
              logInfo('system', `Data history updated`, `${newHistory.length} records stored`);
            }
            return newHistory;
          });
        } catch (error) {
          logError('sensor', 'Failed to parse sensor data', String(error));
        }
      };

      ws.onclose = (event) => {
        logWarning('websocket', `Connection closed (code: ${event.code})`, event.reason || 'No reason provided');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect after 5 seconds
        logInfo('websocket', 'Scheduling reconnection attempt in 5 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          logInfo('websocket', 'Attempting to reconnect...');
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        logError('websocket', 'WebSocket error occurred', 'Check network connection');
        setConnectionStatus('error');
      };
    } catch (error) {
      logError('websocket', 'Failed to create WebSocket connection', String(error));
      setConnectionStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    logInfo('websocket', 'Disconnecting from server...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      logInfo('websocket', 'Cancelled pending reconnection');
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      logSuccess('websocket', 'Disconnected successfully');
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    logInfo('system', 'Greenhouse IoT Dashboard initializing...');
    logInfo('system', 'WebSocket URL configured', WS_URL);
    connect();
    
    return () => {
      logInfo('system', 'Dashboard component unmounting, cleaning up...');
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
