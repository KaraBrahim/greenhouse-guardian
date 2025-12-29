import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit?: string;
  status: string;
  statusType: 'good' | 'warning' | 'danger' | 'info';
  trend?: 'rising' | 'stable' | 'falling';
  icon: ReactNode;
  color: string;
  description?: string;
}

export function SensorCard({
  title,
  value,
  unit,
  status,
  statusType,
  trend,
  icon,
  color,
  description,
}: SensorCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-warning" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-info" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (statusType) {
      case 'good':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'danger':
        return 'bg-destructive';
      default:
        return 'bg-info';
    }
  };

  return (
    <div className="sensor-card group animate-fade-in">
      {/* Colored accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-80"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-lg transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${color}20` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('status-dot', getStatusColor())} />
                <span className="text-xs text-muted-foreground capitalize">{status}</span>
              </div>
            </div>
          </div>
          {trend && getTrendIcon()}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-3">
          <span 
            className="text-4xl font-bold tracking-tight font-mono"
            style={{ color }}
          >
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {unit && (
            <span className="text-lg text-muted-foreground">{unit}</span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Warning indicator for danger status */}
        {statusType === 'danger' && (
          <div className="absolute top-3 right-3">
            <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
