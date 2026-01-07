// Severity levels from backend
export type Severity = 'normal' | 'info' | 'warning' | 'danger';

export interface Alert {
  type: string;
  severity: Severity;
  message: string;
  action?: string;
}

export interface AutomatedAction {
  actuator: string;
  action: string;
  value?: number | string;
}

export interface SensorData {
  // Core identification
  device_id: string;
  timestamp: string;
  
  // Raw sensor values
  temp: number;
  hum: number;
  gas: number;
  motion: number;
  gasAlarm: number;
  button?: number;
  pot?: number;
  
  // Backend-provided status and severity
  temp_status: string;
  temp_severity: Severity;
  hum_status: string;
  hum_severity: Severity;
  air_quality: string;
  air_severity: Severity;
  motion_status: string;
  motion_severity: Severity;
  gas_alarm_status: string;
  gas_alarm_severity: Severity;
  button_status?: string;
  pot_interval?: number;
  
  // Backend-generated alerts and recommendations
  alerts: Alert[];
  recommendations: string[];
  automated_actions: AutomatedAction[];
  
  // Overall system health indicators
  system_health: 'good' | 'attention' | 'critical';
  health_color: string;
  danger_count: number;
  warning_count: number;
  needs_attention: boolean;
  
  // Summary metrics
  environment_score: number;
  
  // Data source tracking
  data_freshness?: 'realtime' | 'delayed' | 'stale';
  temp_trend?: 'rising' | 'stable' | 'falling';
  _source?: 'historical' | 'realtime';
}

export interface Trigger {
  id: string;
  name: string;
  condition: {
    sensor: 'temp' | 'hum' | 'gas' | 'motion' | 'gasAlarm';
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
  motion: 0,
  gasAlarm: 0,
  temp_status: 'cold',
  temp_severity: 'normal',
  hum_status: 'dry',
  hum_severity: 'normal',
  air_quality: 'good',
  air_severity: 'normal',
  gas_alarm_status: 'clear',
  gas_alarm_severity: 'normal',
  motion_status: 'none',
  motion_severity: 'normal',
  alerts: [],
  recommendations: [],
  automated_actions: [],
  system_health: 'attention',
  health_color: 'yellow',
  danger_count: 0,
  warning_count: 0,
  needs_attention: false,
  environment_score: 0,
  data_freshness: 'realtime',
  temp_trend: 'stable',
};
