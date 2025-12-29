import { useWebSocket } from '@/hooks/useWebSocket';
import { SensorCard } from '@/components/SensorCard';
import { AlertsPanel } from '@/components/AlertsPanel';
import { SystemStatus } from '@/components/SystemStatus';
import { TrendChart } from '@/components/TrendChart';
import { SensorDataTable } from '@/components/SensorDataTable';
import { LogsPanel } from '@/components/LogsPanel';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Leaf, 
  Activity, 
  AlertTriangle,
} from 'lucide-react';
import { useEffect } from 'react';
import { logInfo, logSuccess } from '@/types/logs';

export default function Dashboard() {
  const { sensorData, isConnected, connectionStatus, dataHistory } = useWebSocket();

  useEffect(() => {
    logInfo('ui', 'Dashboard page loaded');
    return () => {
      logInfo('ui', 'Dashboard page unloaded');
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      logSuccess('ui', 'Dashboard connected to live data stream');
    }
  }, [isConnected]);

  const getStatusType = (status: string): 'good' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'normal':
      case 'good':
      case 'moist':
      case 'clear':
      case 'none':
        return 'good';
      case 'warm':
      case 'humid':
      case 'moderate':
      case 'wet':
        return 'warning';
      case 'hot':
      case 'cold':
      case 'dry':
      case 'poor':
      case 'hazardous':
      case 'danger':
      case 'detected':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getStatusDescription = (type: string, status: string): string => {
    const descriptions: Record<string, Record<string, string>> = {
      temp: {
        cold: 'Temperature is below optimal range. Consider adjusting heating.',
        normal: 'Temperature is within optimal growing conditions.',
        warm: 'Temperature is slightly elevated. Monitor closely.',
        hot: 'Temperature is too high! Immediate cooling required.',
      },
      humidity: {
        dry: 'Humidity is too low. Plants may need misting.',
        normal: 'Humidity levels are optimal for plant growth.',
        humid: 'High humidity detected. Ensure proper ventilation.',
      },
      air: {
        good: 'Air quality is excellent for plant health.',
        moderate: 'Air quality is acceptable but could be improved.',
        poor: 'Poor air quality detected. Check ventilation system.',
        hazardous: 'Hazardous air conditions! Evacuate and investigate.',
      },
      soil: {
        dry: 'Soil moisture is low. Watering recommended.',
        moist: 'Soil moisture is at optimal levels.',
        wet: 'Soil is saturated. Reduce watering frequency.',
      },
      motion: {
        none: 'No motion detected in the greenhouse.',
        detected: 'Motion detected! Check for authorized access.',
      },
      gas: {
        clear: 'No harmful gases detected.',
        warning: 'Elevated gas levels. Investigate source.',
        danger: 'Dangerous gas levels! Immediate action required.',
      },
    };

    return descriptions[type]?.[status] || 'Status information unavailable.';
  };

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

        {/* System Status */}
        <div className="mb-8">
          <SystemStatus 
            sensorData={sensorData} 
            isConnected={isConnected}
            connectionStatus={connectionStatus}
          />
        </div>

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SensorCard
            title="Temperature"
            value={sensorData.temp}
            unit="°C"
            status={sensorData.temp_status}
            statusType={getStatusType(sensorData.temp_status)}
            trend={sensorData.temp_trend}
            icon={<Thermometer className="w-5 h-5" />}
            color="hsl(15, 90%, 55%)"
            description={getStatusDescription('temp', sensorData.temp_status)}
          />

          <SensorCard
            title="Humidity"
            value={sensorData.hum}
            unit="%"
            status={sensorData.hum_status}
            statusType={getStatusType(sensorData.hum_status)}
            icon={<Droplets className="w-5 h-5" />}
            color="hsl(199, 89%, 48%)"
            description={getStatusDescription('humidity', sensorData.hum_status)}
          />

          <SensorCard
            title="Air Quality"
            value={sensorData.gas}
            unit="ppm"
            status={sensorData.air_quality}
            statusType={getStatusType(sensorData.air_quality)}
            icon={<Wind className="w-5 h-5" />}
            color="hsl(270, 70%, 60%)"
            description={getStatusDescription('air', sensorData.air_quality)}
          />

          <SensorCard
            title="Soil Moisture"
            value={sensorData.water}
            unit="%"
            status={sensorData.soil_status}
            statusType={getStatusType(sensorData.soil_status)}
            icon={<Leaf className="w-5 h-5" />}
            color="hsl(142, 76%, 45%)"
            description={getStatusDescription('soil', sensorData.soil_status)}
          />

          <SensorCard
            title="Motion Sensor"
            value={sensorData.motion === 1 ? 'Active' : 'Clear'}
            status={sensorData.motion_status}
            statusType={getStatusType(sensorData.motion_status)}
            icon={<Activity className="w-5 h-5" />}
            color="hsl(38, 92%, 50%)"
            description={getStatusDescription('motion', sensorData.motion_status)}
          />

          <SensorCard
            title="Gas Alarm"
            value={sensorData.gasAlarm === 1 ? 'Triggered' : 'Safe'}
            status={sensorData.gas_alarm_status}
            statusType={getStatusType(sensorData.gas_alarm_status)}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="hsl(0, 72%, 51%)"
            description={getStatusDescription('gas', sensorData.gas_alarm_status)}
          />
        </div>

        {/* Charts and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <TrendChart
              data={dataHistory}
              dataKey="water"
              color="hsl(142, 76%, 45%)"
              title="Soil Moisture"
            />
          </div>
          <div>
            <AlertsPanel alerts={sensorData.alerts} />
          </div>
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
