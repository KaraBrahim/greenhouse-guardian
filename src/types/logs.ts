export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: 'websocket' | 'sensor' | 'trigger' | 'system' | 'ui';
  message: string;
  details?: string;
}

// Global logs store
let logs: LogEntry[] = [];
let listeners: ((logs: LogEntry[]) => void)[] = [];

const MAX_LOGS = 500;

export const addLog = (
  level: LogLevel,
  category: LogEntry['category'],
  message: string,
  details?: string
) => {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    level,
    category,
    message,
    details,
  };
  
  logs = [entry, ...logs].slice(0, MAX_LOGS);
  
  // Also log to console
  const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
  console[consoleMethod](`[${category.toUpperCase()}] ${message}`, details || '');
  
  // Notify all listeners
  listeners.forEach(listener => listener([...logs]));
  
  return entry;
};

export const getLogs = () => [...logs];

export const clearLogs = () => {
  logs = [];
  listeners.forEach(listener => listener([]));
};

export const subscribeLogs = (listener: (logs: LogEntry[]) => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

// Convenience methods
export const logInfo = (category: LogEntry['category'], message: string, details?: string) => 
  addLog('info', category, message, details);

export const logSuccess = (category: LogEntry['category'], message: string, details?: string) => 
  addLog('success', category, message, details);

export const logWarning = (category: LogEntry['category'], message: string, details?: string) => 
  addLog('warning', category, message, details);

export const logError = (category: LogEntry['category'], message: string, details?: string) => 
  addLog('error', category, message, details);
