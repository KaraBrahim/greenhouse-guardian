import { AutomatedAction } from '@/types/sensor';
import { Zap, Fan, Droplets, Sun, Volume2, DoorOpen, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AutomatedActionsPanelProps {
  actions: AutomatedAction[];
}

const actuatorIcons: Record<string, React.ReactNode> = {
  fan: <Fan className="w-4 h-4" />,
  pump: <Droplets className="w-4 h-4" />,
  led: <Sun className="w-4 h-4" />,
  buzzer: <Volume2 className="w-4 h-4" />,
  door: <DoorOpen className="w-4 h-4" />,
  window: <DoorOpen className="w-4 h-4" />,
  lcd: <MonitorPlay className="w-4 h-4" />,
};

export function AutomatedActionsPanel({ actions }: AutomatedActionsPanelProps) {
  if (actions.length === 0) {
    return (
      <div className="glass rounded-xl p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Suggested Actions
        </h3>
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm">No actions needed</p>
            <p className="text-xs text-muted-foreground/60 mt-1">System is running optimally</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Suggested Actions
        <span className="ml-auto bg-info/20 text-info text-xs px-2 py-0.5 rounded-full">
          {actions.length}
        </span>
      </h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-info/5 border border-info/20 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center text-info">
              {actuatorIcons[action.actuator] || <Zap className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium capitalize">{action.actuator}</p>
              <p className="text-xs text-muted-foreground">
                {action.action}
                {action.value !== undefined && ` → ${action.value}`}
              </p>
            </div>
            <Badge variant="outline" className="text-info border-info/30">
              Auto
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
