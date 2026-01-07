import { useWebSocket } from '@/hooks/useWebSocket';
import { SensorCard } from '@/components/SensorCard';
import { AlertsPanel } from '@/components/AlertsPanel';
import { SystemStatus } from '@/components/SystemStatus';
import { TrendChart } from '@/components/TrendChart';
import { SensorDataTable } from '@/components/SensorDataTable';
import { LogsPanel } from '@/components/LogsPanel';
import { EnvironmentScore } from '@/components/EnvironmentScore';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { AutomatedActionsPanel } from '@/components/AutomatedActionsPanel';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  AlertTriangle,
} from 'lucide-react';
import { useEffect } from 'react';
import { logInfo, logSuccess } from '@/types/logs';

export default function Dashboard() {
  const { sensorData, isConnected, connectionStatus, dataHistory, isLoadingHistory } = useWebSocket();

  useEffect(() => {
    logInfo('ui', 'Dashboard page loaded');
    return () => {
      logInfo('ui', 'Dashboard page unloaded');
    };
  }, []);

  useEffect(() => {
    if (isLoadingHistory) {
      logInfo('ui', 'Loading historical sensor data...');
    }
  }, [isLoadingHistory]);

  useEffect(() => {
    if (isConnected) {
      logSuccess('ui', 'Dashboard connected to live data stream');
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            <span className="text-gradient">Live Monitoring</span>
          </h2>
          <p className="text-muted-foreground">
            Real-time sensor data from your greenhouse environment
          </p>
        </div>

        {/* Environment Score & System Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EnvironmentScore 
            score={sensorData.environment_score}
            dangerCount={sensorData.danger_count}
            warningCount={sensorData.warning_count}
            needsAttention={sensorData.needs_attention}
            healthColor={sensorData.health_color}
          />
          <SystemStatus 
            sensorData={sensorData} 
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            isLoadingHistory={isLoadingHistory}
            historyCount={dataHistory.length}
          />
        </div>

        {/* Sensor Grid - Using backend-provided severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <SensorCard
            title="Temperature"
            value={sensorData.temp}
            unit="°C"
            status={sensorData.temp_status}
            severity={sensorData.temp_severity}
            trend={sensorData.temp_trend}
            icon={<Thermometer className="w-5 h-5" />}
            color="hsl(15, 90%, 55%)"
          />

          <SensorCard
            title="Humidity"
            value={sensorData.hum}
            unit="%"
            status={sensorData.hum_status}
            severity={sensorData.hum_severity}
            icon={<Droplets className="w-5 h-5" />}
            color="hsl(199, 89%, 48%)"
          />

          <SensorCard
            title="Air Quality"
            value={sensorData.gas}
            unit="ppm"
            status={sensorData.air_quality}
            severity={sensorData.air_severity}
            icon={<Wind className="w-5 h-5" />}
            color="hsl(270, 70%, 60%)"
          />

          <SensorCard
            title="Motion"
            value={sensorData.motion === 1 ? 'Detected' : 'None'}
            status={sensorData.motion_status}
            severity={sensorData.motion_severity}
            icon={<Activity className="w-5 h-5" />}
            color="hsl(38, 92%, 50%)"
          />

          <SensorCard
            title="Gas Alarm"
            value={sensorData.gasAlarm === 1 ? 'Active' : 'Clear'}
            status={sensorData.gas_alarm_status}
            severity={sensorData.gas_alarm_severity}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="hsl(0, 72%, 51%)"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <TrendChart
            data={dataHistory}
            dataKey="temp"
            color="hsl(15, 90%, 55%)"
            title="Temperature"
          />
          <TrendChart
            data={dataHistory}
            dataKey="hum"
            color="hsl(199, 89%, 48%)"
            title="Humidity"
          />
          <TrendChart
            data={dataHistory}
            dataKey="gas"
            color="hsl(270, 70%, 60%)"
            title="Gas Level"
          />
        </div>

        {/* Alerts, Recommendations & Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AlertsPanel alerts={sensorData.alerts} />
          <RecommendationsPanel recommendations={sensorData.recommendations} />
          <AutomatedActionsPanel actions={sensorData.automated_actions} />
        </div>

        {/* Data Table */}
        <div className="mb-8">
          <SensorDataTable dataHistory={dataHistory} />
        </div>

        {/* Logs Panel */}
        <div>
          <LogsPanel />
        </div>
      </div>
    </div>
  );
}
