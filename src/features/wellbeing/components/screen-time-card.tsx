import { ArrowDown, ArrowUp, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '../utils/format-duration';

interface ScreenTimeCardProps {
  seconds: number;
  goalSeconds: number;
  changePercent: number;
}

export function ScreenTimeCard({ seconds, goalSeconds, changePercent }: ScreenTimeCardProps) {
  const percentage = Math.min(100, Math.round((seconds / goalSeconds) * 100));
  const improving = changePercent <= 0;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground shadow-xl shadow-primary/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-primary-foreground">Today&apos;s Screen Time</CardTitle>
          <CardDescription className="text-primary-foreground/70">{formatDuration(seconds)} / {formatDuration(goalSeconds)} goal</CardDescription>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm"><Smartphone /></span>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <div
          className="flex size-52 items-center justify-center rounded-full p-3 shadow-2xl"
          style={{ background: `conic-gradient(var(--primary-foreground) ${percentage * 3.6}deg, color-mix(in oklab, var(--primary-foreground) 20%, transparent) 0deg)` }}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-background text-foreground shadow-inner">
            <p className="text-4xl font-black">{formatDuration(seconds)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{percentage}% of daily goal</p>
          </div>
        </div>
        <Badge variant="secondary">
          {improving ? <ArrowDown data-icon="inline-start" /> : <ArrowUp data-icon="inline-start" />}
          {Math.abs(changePercent)}% from yesterday
        </Badge>
      </CardContent>
    </Card>
  );
}
