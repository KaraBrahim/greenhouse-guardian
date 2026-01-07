import { Alert } from '@/types/sensor';
import { AlertTriangle, Info, AlertCircle, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'danger':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'danger':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      default:
        return 'bg-info/10 border-info/30 text-info';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="glass rounded-xl p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Active Alerts
        </h3>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Info className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm">No active alerts</p>
            <p className="text-xs text-muted-foreground/60 mt-1">All systems operating normally</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-primary" />
        Active Alerts
        <span className="ml-auto bg-destructive/20 text-destructive text-xs px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col gap-2 p-3 rounded-lg border animate-scale-in',
              getAlertStyles(alert.severity)
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">
                  {alert.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
              </div>
            </div>
            {alert.action && (
              <div className="flex items-center gap-1 text-xs opacity-70 pl-7">
                <ArrowRight className="w-3 h-3" />
                <span>{alert.action}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
