import { SensorData } from '@/types/sensor';
import { Activity, Wifi, WifiOff, Clock, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusProps {
  sensorData: SensorData;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function SystemStatus({ sensorData, isConnected, connectionStatus }: SystemStatusProps) {
  const getHealthColor = () => {
    switch (sensorData.system_health) {
      case 'good':
        return 'text-success';
      case 'attention':
        return 'text-warning';
      case 'critical':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getHealthBg = () => {
    switch (sensorData.system_health) {
      case 'good':
        return 'bg-success/10';
      case 'attention':
        return 'bg-warning/10';
      case 'critical':
        return 'bg-destructive/10';
      default:
        return 'bg-muted';
    }
  };

  const getConnectionIcon = () => {
    if (connectionStatus === 'connected') {
      return <Wifi className="w-4 h-4 text-success" />;
    }
    if (connectionStatus === 'connecting') {
      return <Wifi className="w-4 h-4 text-warning animate-pulse" />;
    }
    return <WifiOff className="w-4 h-4 text-destructive" />;
  };

  const getFreshnessColor = () => {
    switch (sensorData.data_freshness) {
      case 'realtime':
        return 'text-success';
      case 'delayed':
        return 'text-warning';
      case 'stale':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        System Status
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Connection Status */}
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            {getConnectionIcon()}
            <span className="text-xs text-muted-foreground">Connection</span>
          </div>
          <p className="text-sm font-medium capitalize">{connectionStatus}</p>
        </div>

        {/* System Health */}
        <div className={cn('p-4 rounded-lg', getHealthBg())}>
          <div className="flex items-center gap-2 mb-2">
            <Server className={cn('w-4 h-4', getHealthColor())} />
            <span className="text-xs text-muted-foreground">Health</span>
          </div>
          <p className={cn('text-sm font-medium capitalize', getHealthColor())}>
            {sensorData.system_health}
          </p>
        </div>

        {/* Data Freshness */}
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className={cn('w-4 h-4', getFreshnessColor())} />
            <span className="text-xs text-muted-foreground">Data</span>
          </div>
          <p className={cn('text-sm font-medium capitalize', getFreshnessColor())}>
            {sensorData.data_freshness}
          </p>
        </div>

        {/* Last Update */}
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Last Update</span>
          </div>
          <p className="text-sm font-medium font-mono">
            {formatTimestamp(sensorData.timestamp)}
          </p>
        </div>
      </div>

      {/* Device ID */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Device ID</span>
          <span className="font-mono text-primary">{sensorData.device_id}</span>
        </div>
      </div>
    </div>
  );
}
