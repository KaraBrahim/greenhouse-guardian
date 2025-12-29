import { useLogs } from '@/hooks/useLogs';
import { LogEntry } from '@/types/logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Wifi,
  Activity,
  Zap,
  Settings,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getLevelIcon = (level: LogEntry['level']) => {
  switch (level) {
    case 'info':
      return <Info className="w-3 h-3" />;
    case 'success':
      return <CheckCircle2 className="w-3 h-3" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3" />;
    case 'error':
      return <XCircle className="w-3 h-3" />;
  }
};

const getLevelStyle = (level: LogEntry['level']) => {
  switch (level) {
    case 'info':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'success':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'warning':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'error':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
  }
};

const getCategoryIcon = (category: LogEntry['category']) => {
  switch (category) {
    case 'websocket':
      return <Wifi className="w-3 h-3" />;
    case 'sensor':
      return <Activity className="w-3 h-3" />;
    case 'trigger':
      return <Zap className="w-3 h-3" />;
    case 'system':
      return <Settings className="w-3 h-3" />;
    case 'ui':
      return <Monitor className="w-3 h-3" />;
  }
};

const getCategoryStyle = (category: LogEntry['category']) => {
  switch (category) {
    case 'websocket':
      return 'text-purple-400 bg-purple-500/10';
    case 'sensor':
      return 'text-cyan-400 bg-cyan-500/10';
    case 'trigger':
      return 'text-orange-400 bg-orange-500/10';
    case 'system':
      return 'text-gray-400 bg-gray-500/10';
    case 'ui':
      return 'text-pink-400 bg-pink-500/10';
  }
};

export function LogsPanel() {
  const { logs, clearLogs } = useLogs();

  const formatTime = (date: Date) => {
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="w-5 h-5 text-primary" />
            System Logs
            <Badge variant="outline" className="ml-2">
              {logs.length} entries
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearLogs}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border border-border/50 bg-background/50">
          <div className="p-2 space-y-1 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs yet. System activity will appear here.
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded border transition-colors",
                    getLevelStyle(log.level)
                  )}
                >
                  <span className="text-muted-foreground whitespace-nowrap">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium", getCategoryStyle(log.category))}>
                    {getCategoryIcon(log.category)}
                    {log.category}
                  </span>
                  <span className="flex items-center gap-1">
                    {getLevelIcon(log.level)}
                  </span>
                  <span className="flex-1">
                    {log.message}
                    {log.details && (
                      <span className="text-muted-foreground ml-2">
                        ({log.details})
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
