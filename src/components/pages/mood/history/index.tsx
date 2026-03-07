'use client';

import React from 'react';
import { useMoodStore } from '@/store/useMoodStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

export default function MoodHistoryPage() {
  const router = useRouter();
  const { history } = useMoodStore();

  // Convert history entries to a sorted array (descending)
  const entries = Object.entries(history)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([date, entry]) => ({ date, ...entry }));

  return (
    <div className="pb-20">
      <header className="flex items-center gap-4 px-4 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Mood Stat History</h1>
      </header>

      <div className="px-4 space-y-4">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry.date}
              className="bg-card rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-border"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-3xl shrink-0">
                {entry.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground truncate">
                    {entry.label} {entry.tag && `• ${entry.tag}`}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {format(parseISO(entry.timestamp), 'eeee, MMM d, yyyy • hh:mm a')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-4xl">
              😶‍🌫️
            </div>
            <div>
              <p className="text-muted-foreground font-bold">No mood history yet</p>
              <p className="text-muted-foreground/70 text-sm mt-1">
                Start tracking how you feel each day
              </p>
            </div>
            <Button onClick={() => router.push('/mood')} className="rounded-xl px-6">
              Log your first mood
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
