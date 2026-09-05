import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWellbeingLevel } from '../domain/calculate-wellbeing-score';

export function WellbeingScoreCard({ score }: { score: number }) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-primary/10 bg-gradient-to-br from-card to-primary/5 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div><CardTitle>Wellbeing Score</CardTitle>
        <CardDescription>Balance across your daily digital habits</CardDescription>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles /></span>
      </CardHeader>
      <CardContent className="flex items-center gap-5">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-black text-primary-foreground shadow-lg shadow-primary/20 ring-8 ring-primary/10">
          {score}
        </div>
        <div>
          <Badge>{getWellbeingLevel(score)}</Badge>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Focus time and lower screen time are helping your score.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
