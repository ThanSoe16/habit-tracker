'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BedtimeSchedule, toBedtimeFormValue, type BedtimeFormValue } from '../components/bedtime-schedule';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';

function BedtimeEditor({ initialValue, refresh }: { initialValue: BedtimeFormValue; refresh: () => Promise<void> }) {
  const [value, setValue] = useState(initialValue);
  const save = async () => {
    try {
      await digitalWellbeingService.upsertBedtime({ bedtime: value.bedtime || null, wake_time: value.wakeTime || null, active_days: value.activeDays.map(Number), bedtime_reminder_enabled: value.reminder, reduce_notifications: value.notifications, reduce_distracting_apps: value.distractingApps, grayscale_enabled: value.grayscale });
      await refresh();
      toast.success('Bedtime schedule saved.');
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not save the schedule.'); }
  };
  return (
    <Card className="rounded-[2rem] shadow-sm">
      <CardHeader><CardTitle>Bedtime Schedule</CardTitle><CardDescription>Create a quieter window from 11:00 PM to 7:00 AM.</CardDescription></CardHeader>
      <CardContent><BedtimeSchedule value={value} onChange={setValue} /></CardContent>
      <CardFooter><Button className="w-full" onClick={() => void save()}>Save schedule</Button></CardFooter>
    </Card>
  );
}

export default function BedtimePage() {
  const { bedtime, isLoading, error, refresh } = useWellbeingData();
  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;
  return <BedtimeEditor key={bedtime?.updated_at ?? 'new'} initialValue={toBedtimeFormValue(bedtime)} refresh={refresh} />;
}
