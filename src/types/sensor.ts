export interface SensorData {
  device_id: string;
  timestamp: string;
  temp: number;
  hum: number;
  gas: number;
  water: number;
  motion: number;
  gasAlarm: number;
  temp_status: 'cold' | 'normal' | 'warm' | 'hot';
  hum_status: 'dry' | 'normal' | 'humid';
  air_quality: 'good' | 'moderate' | 'poor' | 'hazardous';
  soil_status: 'dry' | 'moist' | 'wet';
  motion_status: 'none' | 'detected';
  gas_alarm_status: 'clear' | 'warning' | 'danger';
  alerts: Alert[];
  system_health: 'good' | 'attention' | 'critical';
  data_freshness: 'realtime' | 'delayed' | 'stale';
  temp_trend: 'rising' | 'stable' | 'falling';
}

export interface Alert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export interface Trigger {
  id: string;
  name: string;
  condition: {
    sensor: keyof Pick<SensorData, 'temp' | 'hum' | 'gas' | 'water' | 'motion' | 'gasAlarm'>;
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
  };
  actions: TriggerAction[];
  enabled: boolean;
}

export interface TriggerAction {
  type: 'alert' | 'email' | 'webhook' | 'notification' | 'device_control';
  config: Record<string, string>;
}

export const defaultSensorData: SensorData = {
  device_id: 'esp32_device',
  timestamp: new Date().toISOString(),
  temp: 0,
  hum: 0,
  gas: 0,
  water: 0,
  motion: 0,
  gasAlarm: 0,
  temp_status: 'cold',
  hum_status: 'dry',
  air_quality: 'good',
  soil_status: 'dry',
  motion_status: 'none',
  gas_alarm_status: 'clear',
  alerts: [],
  system_health: 'attention',
  data_freshness: 'realtime',
  temp_trend: 'stable',
};
