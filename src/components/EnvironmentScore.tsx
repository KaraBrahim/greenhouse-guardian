import { cn } from '@/lib/utils';
import { Gauge, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EnvironmentScoreProps {
  score: number;
  dangerCount: number;
  warningCount: number;
  needsAttention: boolean;
  healthColor: string;
}

export function EnvironmentScore({ 
  score, 
  dangerCount, 
  warningCount, 
  needsAttention,
  healthColor 
}: EnvironmentScoreProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGradient = () => {
    if (score >= 80) return 'from-success/20 to-success/5';
    if (score >= 60) return 'from-warning/20 to-warning/5';
    return 'from-destructive/20 to-destructive/5';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className={cn(
      "glass rounded-xl p-6 animate-fade-in bg-gradient-to-br",
      getScoreGradient()
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className={cn("w-5 h-5", getScoreColor())} />
          <h3 className="text-lg font-semibold">Environment Score</h3>
        </div>
        {needsAttention ? (
          <AlertTriangle className="w-5 h-5 text-warning animate-pulse" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-success" />
        )}
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className={cn(
            "text-6xl font-bold tracking-tight",
            getScoreColor()
          )}>
            {score}
          </div>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="flex-1">
          <p className={cn("text-xl font-medium mb-1", getScoreColor())}>
            {getScoreLabel()}
          </p>
          <p className="text-sm text-muted-foreground">
            Overall greenhouse environment quality
          </p>
        </div>
      </div>

      {/* Issue Counts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Critical Issues</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{dangerCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-warning">{warningCount}</p>
        </div>
      </div>
    </div>
  );
}
