'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <Card className="rounded-[2rem]"><CardHeader><CardTitle>Wellbeing data unavailable</CardTitle><CardDescription>We could not load this page. Your saved data has not been changed.</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">Check your connection and try again.</CardContent><CardFooter><Button onClick={reset}>Try again</Button></CardFooter></Card>;
}
