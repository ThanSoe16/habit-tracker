'use client';

import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { ChallengeCard } from '../components/challenge-card';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';
import type { WellbeingChallenge } from '../types';

export default function ChallengesPage() {
  const { challenges, rows, isLoading, error, refresh } = useWellbeingData();
  const handleAction = async (challenge: WellbeingChallenge) => {
    try {
      if (challenge.status === 'ACTIVE' && challenge.enrollmentId) {
        await digitalWellbeingService.cancelChallenge(challenge.enrollmentId);
      } else {
        const template = rows.challenges.find((item) => item.id === challenge.id);
        if (template) await digitalWellbeingService.startChallenge(template);
      }
      await refresh();
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not update the challenge.'); }
  };

  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;
  return (
    <div className="flex flex-col gap-4">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onAction={() => void handleAction(challenge)}
        />
      ))}
      {!challenges.length && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No challenges are available.</CardContent></Card>}
    </div>
  );
}
