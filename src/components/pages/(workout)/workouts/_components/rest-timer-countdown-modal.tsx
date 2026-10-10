'use client';

import { useEffect, useReducer, useRef } from 'react';
import { Pause, Play, Plus, SkipForward } from 'lucide-react';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { createRestCountdown, restCountdownReducer } from '@/features/gym/utils/rest-countdown';
import type { createTimerSound } from '@/features/habits/utils/timer-sound';
import { RestTimerFloatingButton } from './rest-timer-floating-button';

interface RestTimerCountdownModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onComplete: () => void;
  exerciseName?: string;
  initialSeconds: number;
  autoStart: boolean;
  sound: ReturnType<typeof createTimerSound>;
}

export function RestTimerCountdownModal({
  isOpen,
  onOpenChange,
  onClose,
  onComplete,
  exerciseName,
  initialSeconds,
  autoStart,
  sound,
}: RestTimerCountdownModalProps) {
  const [timer, dispatch] = useReducer(restCountdownReducer, null, () =>
    createRestCountdown(initialSeconds, Date.now(), autoStart),
  );
  const completionHandled = useRef(false);
  const running = timer.deadline !== null;
  const finished = timer.remaining === 0;

  useEffect(() => {
    if (!running) return;
    // A deadline keeps the countdown accurate after background throttling.
    const tick = () => dispatch({ type: 'tick', now: Date.now() });
    const interval = window.setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running]);

  useEffect(() => {
    if (!finished || completionHandled.current) return;
    completionHandled.current = true;
    sound.play();
    onComplete();
  }, [finished, onComplete, sound]);

  function skip() {
    if (!completionHandled.current) {
      completionHandled.current = true;
      onComplete();
    }
    onClose();
  }

  const time = `${Math.floor(timer.remaining / 60)
    .toString()
    .padStart(2, '0')}:${(timer.remaining % 60).toString().padStart(2, '0')}`;
  const circumference = 2 * Math.PI * 45;

  return (
    <>
      {!isOpen && (
        <RestTimerFloatingButton
          onClick={() => onOpenChange(true)}
          label={finished ? 'Rest complete' : `${time}${running ? '' : ' · Paused'}`}
        />
      )}
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <Flex
            direction="column"
            gap="6"
            className="mx-auto flex min-h-0 w-full max-w-sm flex-col gap-6 overflow-y-auto px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3"
          >
            <DrawerHeader className="gap-2 p-0 text-center md:gap-2 md:text-center">
              <DrawerTitle className="text-2xl font-black">Rest timer</DrawerTitle>
              <DrawerDescription className="text-xs">
                {exerciseName || 'Take a break between sets.'}
              </DrawerDescription>
            </DrawerHeader>

            <Flex
              align="center"
              justify="center"
              className="relative mx-auto flex size-56 shrink-0 items-center justify-center"
            >
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 size-full -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="2 4"
                  className="text-primary/15"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - timer.remaining / timer.duration)}
                  className="text-primary transition-all duration-200"
                />
              </svg>
              <div className="text-center">
                <span
                  role="timer"
                  aria-label={`${time} remaining`}
                  className="block font-mono text-5xl font-black tabular-nums tracking-tight"
                >
                  {time}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {finished
                    ? 'Rest complete!'
                    : running
                      ? 'remaining'
                      : timer.started
                        ? 'paused'
                        : 'ready'}
                </span>
              </div>
            </Flex>
            <p role="status" className="sr-only">
              {finished ? 'Rest complete. Ready for your next set.' : ''}
            </p>

            <Flex justify="between" gap="3" className="flex justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={finished}
                onClick={() => dispatch({ type: 'add', now: Date.now() })}
                className="rounded-full text-primary"
              >
                <Plus className="size-4" /> 30 sec
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={finished ? onClose : skip}
                className="rounded-full text-primary"
              >
                <SkipForward className="size-4" /> {finished ? 'Done' : 'Skip rest'}
              </Button>
            </Flex>

            <Grid columns="2" gap="3" className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-14 rounded-3xl font-bold"
              >
                {finished ? 'Close' : 'Cancel'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (finished) {
                    onClose();
                    return;
                  }
                  sound.prepare();
                  dispatch({ type: running ? 'pause' : 'start', now: Date.now() });
                }}
                className="h-14 rounded-3xl font-bold shadow-lg shadow-primary/20"
              >
                {finished ? (
                  'Done'
                ) : running ? (
                  <>
                    <Pause className="size-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="size-4" /> {timer.started ? 'Resume' : 'Start'}
                  </>
                )}
              </Button>
            </Grid>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="mx-auto rounded-full text-muted-foreground"
            >
              Minimize
            </Button>
          </Flex>
        </DrawerContent>
      </Drawer>
    </>
  );
}
