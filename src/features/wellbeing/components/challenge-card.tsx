import { Brain, Check, MoonStar, Play, Smartphone, Trophy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { WellbeingChallenge } from '../types';

export function ChallengeCard({ challenge, onAction }: { challenge: WellbeingChallenge; onAction: () => void }) {
  const percentage = challenge.target > 0 ? Math.min(100, (challenge.progress / challenge.target) * 100) : 0;
  const Icon = challenge.type === 'FOCUS_SESSION_COUNT' || challenge.type === 'FOCUS_TIME'
    ? Brain
    : challenge.type === 'NO_LATE_NIGHT_USAGE'
      ? MoonStar
      : challenge.type.includes('SCREEN_TIME') || challenge.type.includes('APP_USAGE')
        ? Smartphone
        : Trophy;
  const statusLabel = challenge.status === 'ACTIVE'
    ? 'In progress'
    : challenge.status === 'COMPLETED'
      ? 'Completed'
      : 'Available';
  const targetLabel = challenge.type === 'FOCUS_SESSION_COUNT'
    ? 'sessions'
    : challenge.type === 'NO_LATE_NIGHT_USAGE'
      ? 'nights'
      : challenge.unit === 'count'
        ? 'days'
        : challenge.unit;
  const ActionIcon = challenge.status === 'ACTIVE' ? X : challenge.status === 'COMPLETED' ? Check : Play;

  return (
    <Card size="sm" className="overflow-hidden rounded-[2rem] border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Icon /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{challenge.title}</CardTitle>
            <Badge variant={challenge.status === 'ACTIVE' ? 'default' : challenge.status === 'COMPLETED' ? 'secondary' : 'outline'}>{statusLabel}</Badge>
          </div>
          <CardDescription className="mt-1">{challenge.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{challenge.progress} of {challenge.target} {targetLabel}</span></div>
        <Progress value={percentage} className="h-1.5" />
      </CardContent>
      <CardFooter>
        <Button variant={challenge.status === 'ACTIVE' ? 'destructive' : challenge.status === 'COMPLETED' ? 'secondary' : 'outline'} className="w-full" onClick={onAction} disabled={challenge.status === 'COMPLETED'}>
          <ActionIcon data-icon="inline-start" />
          {challenge.status === 'ACTIVE' ? 'Cancel challenge' : challenge.status === 'COMPLETED' ? 'Completed' : 'Start challenge'}
        </Button>
      </CardFooter>
    </Card>
  );
}
