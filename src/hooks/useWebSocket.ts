import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, defaultSensorData } from '@/types/sensor';
import { logInfo, logSuccess, logWarning, logError } from '@/types/logs';

// Update this to your new server IP/URL
const WS_URL = 'ws://13.221.104.81:8000/ws/sensors/esp32_device';

interface WebSocketMessage {
  type: 'historical' | 'realtime' | 'ping';
  data?: SensorData;
  timestamp?: string;
}

export function useWebSocket() {
  const [sensorData, setSensorData] = useState<SensorData>(defaultSensorData);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCountRef = useRef(0);
  const historicalCountRef = useRef(0);
  const realtimeCountRef = useRef(0);

  const processHistoricalData = useCallback((data: SensorData) => {
    historicalCountRef.current++;
    console.log(`[HISTORICAL] Record #${historicalCountRef.current}:`, data.timestamp);
    
    // Tag data as historical
    const taggedData = { ...data, _source: 'historical' as const };
    
    setDataHistory(prev => {
      const newHistory = [...prev, taggedData];
      return newHistory;
    });

    // Update current display to latest historical if no realtime yet
    if (realtimeCountRef.current === 0) {
      setSensorData(taggedData);
    }
  }, []);

  const processRealtimeData = useCallback((data: SensorData) => {
    realtimeCountRef.current++;
    const receiveTime = new Date();
    setLastUpdate(receiveTime);
    
    // Tag data as realtime
    const taggedData = { ...data, _source: 'realtime' as const };
    
    logSuccess('sensor', `📡 REALTIME #${realtimeCountRef.current} at ${receiveTime.toLocaleTimeString()}`, 
      `Temp: ${data.temp}°C | Hum: ${data.hum}% | Gas: ${data.gas}ppm | Water: ${data.water}%`);
    
    console.log(`[REALTIME] Message #${realtimeCountRef.current}:`, {
      timestamp: data.timestamp,
      temp: data.temp,
      hum: data.hum,
      gas: data.gas,
      water: data.water,
      motion: data.motion,
      system_health: data.system_health
    });
    
    // Log status changes
    if (data.system_health === 'critical') {
      logError('sensor', '🚨 CRITICAL: System health is critical!', JSON.stringify(data.alerts));
    } else if (data.system_health === 'attention') {
      logWarning('sensor', '⚠️ System requires attention', JSON.stringify(data.alerts));
    }
    
    // Log individual sensor alerts
    if (data.temp_status === 'hot') {
      logWarning('sensor', '🌡️ High temperature alert', `${data.temp}°C`);
    }
    if (data.temp_status === 'cold') {
      logInfo('sensor', '❄️ Low temperature detected', `${data.temp}°C`);
    }
    if (data.air_quality === 'poor' || data.air_quality === 'hazardous') {
      logError('sensor', '💨 Air quality alert', data.air_quality);
    }
    if (data.motion_status === 'detected') {
      logWarning('sensor', '🚶 Motion detected in greenhouse');
    }
    if (data.gas_alarm_status !== 'clear') {
      logError('sensor', '⚠️ Gas alarm triggered!', data.gas_alarm_status);
    }
    
    // Update current sensor data
    setSensorData(taggedData);
    console.log('[STATE] sensorData updated with realtime data');
    
    // Add to history
    setDataHistory(prev => {
      const newHistory = [...prev, taggedData].slice(-100); // Keep last 100 records
      console.log(`[STATE] dataHistory updated: ${newHistory.length} records`);
      return newHistory;
    });
  }, []);

  const processPing = useCallback((timestamp?: string) => {
    logInfo('websocket', '🏓 Ping received - connection alive', timestamp || '');
    console.log('[PING] Keep-alive received at:', timestamp);
    // Don't update charts or data on ping - just log it
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logWarning('websocket', 'Connection attempt ignored - already connected');
      return;
    }

    logInfo('websocket', 'Initiating WebSocket connection...', WS_URL);
    setConnectionStatus('connecting');
    setIsLoadingHistory(true);
    historicalCountRef.current = 0;
    realtimeCountRef.current = 0;
    
    try {
      // Check if we're on HTTPS and trying to connect to WS (insecure)
      if (window.location.protocol === 'https:' && WS_URL.startsWith('ws://')) {
        logError('websocket', 'SECURITY BLOCK: Cannot connect to ws:// from https:// page', 
          'Run locally on http:// or use wss:// endpoint');
        setConnectionStatus('error');
        setIsLoadingHistory(false);
        return;
      }

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      logInfo('websocket', 'WebSocket instance created, waiting for connection...');

      ws.onopen = () => {
        logSuccess('websocket', '✓ Successfully connected to sensor server');
        console.log('[WEBSOCKET] Connected successfully to:', WS_URL);
        setIsConnected(true);
        setConnectionStatus('connected');
        messageCountRef.current = 0;
        logInfo('system', 'Waiting for historical data...');
      };

      ws.onmessage = (event) => {
        console.log('[WEBSOCKET] Raw message received:', event.data);
        messageCountRef.current++;
        
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          console.log(`[WEBSOCKET] Message #${messageCountRef.current} - Type: ${message.type}`);
          
          switch (message.type) {
            case 'historical':
              if (message.data) {
                processHistoricalData(message.data);
              } else {
                logWarning('websocket', 'Historical message received without data');
              }
              break;
              
            case 'realtime':
              setIsLoadingHistory(false); // Historical loading complete when realtime starts
              if (historicalCountRef.current > 0 && realtimeCountRef.current === 0) {
                logSuccess('system', `📚 Historical data loaded: ${historicalCountRef.current} records`);
              }
              if (message.data) {
                processRealtimeData(message.data);
              } else {
                logWarning('websocket', 'Realtime message received without data');
              }
              break;
              
            case 'ping':
              setIsLoadingHistory(false); // If we get ping, historical loading is done
              if (historicalCountRef.current > 0 && realtimeCountRef.current === 0) {
                logSuccess('system', `📚 Historical data loaded: ${historicalCountRef.current} records`);
              }
              processPing(message.timestamp);
              break;
              
            default:
              // Fallback: try to handle as direct sensor data (old format)
              logWarning('websocket', `Unknown message type: ${message.type}`, JSON.stringify(message));
              if ('temp' in message && 'hum' in message) {
                logInfo('websocket', 'Detected legacy format, processing as realtime data');
                processRealtimeData(message as unknown as SensorData);
              }
          }
        } catch (error) {
          logError('sensor', '❌ Failed to parse message', String(error));
          console.error('[WEBSOCKET] Parse error:', error, 'Raw data:', event.data);
        }
      };

      ws.onclose = (event) => {
        logWarning('websocket', `Connection closed (code: ${event.code})`, event.reason || 'No reason provided');
        console.log('[WEBSOCKET] Connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setIsLoadingHistory(false);
        
        // Auto-reconnect after 5 seconds
        logInfo('websocket', '🔄 Scheduling reconnection attempt in 5 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          logInfo('websocket', 'Attempting to reconnect...');
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        logError('websocket', '❌ WebSocket error occurred', 'Check network connection and server status');
        console.error('[WEBSOCKET] Error:', error);
        setConnectionStatus('error');
        setIsLoadingHistory(false);
      };
    } catch (error) {
      logError('websocket', 'Failed to create WebSocket connection', String(error));
      console.error('[WEBSOCKET] Creation error:', error);
      setConnectionStatus('error');
      setIsLoadingHistory(false);
    }
  }, [processHistoricalData, processRealtimeData, processPing]);

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
    setIsLoadingHistory(false);
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
    isLoadingHistory,
    connect,
    disconnect,
  };
}
