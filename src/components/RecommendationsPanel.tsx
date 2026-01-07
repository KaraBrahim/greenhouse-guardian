import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationsPanelProps {
  recommendations: string[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="glass rounded-xl p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Recommendations
        </h3>
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Lightbulb className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm">No recommendations</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Environment is optimal</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        Recommendations
        <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
          {recommendations.length}
        </span>
      </h3>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
              {index + 1}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{rec}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
