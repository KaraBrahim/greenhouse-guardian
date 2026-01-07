import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, defaultSensorData } from '@/types/sensor';
import { logInfo, logSuccess, logWarning, logError } from '@/types/logs';

// Update this to your server IP/URL
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

  // Normalize backend data to ensure all required fields exist
  const normalizeData = useCallback((data: Partial<SensorData>): SensorData => {
    return {
      ...defaultSensorData,
      ...data,
      // Ensure severity fields have defaults
      temp_severity: data.temp_severity || 'normal',
      hum_severity: data.hum_severity || 'normal',
      air_severity: data.air_severity || 'normal',
      motion_severity: data.motion_severity || 'normal',
      gas_alarm_severity: data.gas_alarm_severity || 'normal',
      // Ensure arrays exist
      alerts: data.alerts || [],
      recommendations: data.recommendations || [],
      automated_actions: data.automated_actions || [],
      // Ensure summary metrics exist
      environment_score: data.environment_score ?? 0,
      danger_count: data.danger_count ?? 0,
      warning_count: data.warning_count ?? 0,
      needs_attention: data.needs_attention ?? false,
      health_color: data.health_color || 'gray',
    };
  }, []);

  const processHistoricalData = useCallback((data: Partial<SensorData>) => {
    historicalCountRef.current++;
    const normalizedData = normalizeData(data);
    
    console.log(`[HISTORICAL] Record #${historicalCountRef.current}:`, normalizedData.timestamp);
    
    const taggedData = { ...normalizedData, _source: 'historical' as const };
    
    setDataHistory(prev => {
      const newHistory = [...prev, taggedData];
      return newHistory;
    });

    if (realtimeCountRef.current === 0) {
      setSensorData(taggedData);
    }
  }, [normalizeData]);

  const processRealtimeData = useCallback((data: Partial<SensorData>) => {
    realtimeCountRef.current++;
    const receiveTime = new Date();
    setLastUpdate(receiveTime);
    
    const normalizedData = normalizeData(data);
    const taggedData = { ...normalizedData, _source: 'realtime' as const };
    
    logSuccess('sensor', `📡 REALTIME #${realtimeCountRef.current} at ${receiveTime.toLocaleTimeString()}`, 
      `Score: ${taggedData.environment_score} | Temp: ${taggedData.temp}°C | Hum: ${taggedData.hum}%`);
    
    console.log(`[REALTIME] Message #${realtimeCountRef.current}:`, {
      timestamp: taggedData.timestamp,
      environment_score: taggedData.environment_score,
      temp: `${taggedData.temp}°C (${taggedData.temp_status}/${taggedData.temp_severity})`,
      hum: `${taggedData.hum}% (${taggedData.hum_status}/${taggedData.hum_severity})`,
      gas: `${taggedData.gas}ppm (${taggedData.air_quality}/${taggedData.air_severity})`,
      alerts: taggedData.alerts.length,
      recommendations: taggedData.recommendations.length,
      automated_actions: taggedData.automated_actions.length,
      system_health: taggedData.system_health,
    });
    
    // Log based on backend-provided severity
    if (taggedData.system_health === 'critical') {
      logError('sensor', '🚨 CRITICAL: System health is critical!', `${taggedData.danger_count} critical issues`);
    } else if (taggedData.needs_attention) {
      logWarning('sensor', '⚠️ System requires attention', `${taggedData.warning_count} warnings`);
    }
    
    // Log individual sensor alerts based on backend severity
    if (taggedData.temp_severity === 'danger') {
      logError('sensor', `🌡️ Temperature alert: ${taggedData.temp_status}`, `${taggedData.temp}°C`);
    } else if (taggedData.temp_severity === 'warning') {
      logWarning('sensor', `🌡️ Temperature warning: ${taggedData.temp_status}`, `${taggedData.temp}°C`);
    }
    
    if (taggedData.air_severity === 'danger') {
      logError('sensor', `💨 Air quality alert: ${taggedData.air_quality}`, `${taggedData.gas}ppm`);
    }
    
    if (taggedData.motion_severity !== 'normal') {
      logWarning('sensor', '🚶 Motion detected in greenhouse');
    }
    
    if (taggedData.gas_alarm_severity === 'danger') {
      logError('sensor', '⚠️ Gas alarm triggered!', taggedData.gas_alarm_status);
    }
    
    // Log recommendations if any
    if (taggedData.recommendations.length > 0) {
      logInfo('sensor', `💡 ${taggedData.recommendations.length} recommendation(s)`, taggedData.recommendations[0]);
    }
    
    setSensorData(taggedData);
    console.log('[STATE] sensorData updated with realtime data');
    
    setDataHistory(prev => {
      const newHistory = [...prev, taggedData].slice(-100);
      console.log(`[STATE] dataHistory updated: ${newHistory.length} records`);
      return newHistory;
    });
  }, [normalizeData]);

  const processPing = useCallback((timestamp?: string) => {
    logInfo('websocket', '🏓 Ping received - connection alive', timestamp || '');
    console.log('[PING] Keep-alive received at:', timestamp);
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
              setIsLoadingHistory(false);
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
              setIsLoadingHistory(false);
              if (historicalCountRef.current > 0 && realtimeCountRef.current === 0) {
                logSuccess('system', `📚 Historical data loaded: ${historicalCountRef.current} records`);
              }
              processPing(message.timestamp);
              break;
              
            default:
              logWarning('websocket', `Unknown message type: ${message.type}`, JSON.stringify(message));
              if ('temp' in message && 'hum' in message) {
                logInfo('websocket', 'Detected legacy format, processing as realtime data');
                processRealtimeData(message as unknown as Partial<SensorData>);
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
