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
  return (
    <Card className="overflow-hidden rounded-[2rem] border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex-row items-start gap-4 bg-gradient-to-br from-primary/10 to-transparent">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Icon /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2"><CardTitle>{challenge.title}</CardTitle><Badge variant={challenge.status === 'COMPLETED' ? 'secondary' : 'outline'}>{challenge.status}</Badge></div>
          <CardDescription className="mt-1.5">{challenge.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between text-xs"><span>Progress</span><span className="font-bold">{challenge.progress} / {challenge.target} {challenge.unit}</span></div>
        <Progress value={percentage} />
      </CardContent>
      <CardFooter>
        <Button variant={challenge.status === 'ACTIVE' ? 'outline' : 'default'} className="w-full" onClick={onAction} disabled={challenge.status === 'COMPLETED'}>
          {challenge.status === 'ACTIVE' ? 'Cancel challenge' : challenge.status === 'COMPLETED' ? 'Completed' : 'Start challenge'}
        </Button>
      </CardFooter>
    </Card>
  );
}
import { Brain, MoonStar, Smartphone, Trophy } from 'lucide-react';
