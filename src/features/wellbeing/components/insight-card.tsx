import { CircleAlert, Lightbulb, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { WellbeingInsight } from '../types';
import { cn } from '@/utils/cn';

export function InsightCard({ insight }: { insight: WellbeingInsight }) {
  const Icon = insight.severity === 'positive' ? TrendingDown : insight.severity === 'warning' ? CircleAlert : Lightbulb;
  return (
    <Card className="rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex gap-3 p-4">
        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', insight.severity === 'warning' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary')}><Icon /></span>
        <div>
          <p className="text-sm font-bold">{insight.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
