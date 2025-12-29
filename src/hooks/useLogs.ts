import { useState, useEffect } from 'react';
import { LogEntry, subscribeLogs, getLogs, clearLogs } from '@/types/logs';

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(getLogs());

  useEffect(() => {
    const unsubscribe = subscribeLogs(setLogs);
    return unsubscribe;
  }, []);

  return {
    logs,
    clearLogs,
  };
}
