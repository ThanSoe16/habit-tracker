'use client';

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { MOODS, useMoodStore } from '@/store/use-mood-store';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { useUserStore } from '@/store/use-user-store';
import { cn } from '@/utils/cn';

interface MoodEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

const TAG_GROUPS: Record<string, string[]> = {
  Great: [
    'Happy',
    'Brave',
    'Motivated',
    'Creative',
    'Confident',
    'Calm',
    'Grateful',
    'Peaceful',
    'Excited',
    'Loved',
    'Hopeful',
    'Inspired',
    'Proud',
    'Euphoric',
    'Nostalgic',
  ],
  Good: [
    'Happy',
    'Calm',
    'Peaceful',
    'Grateful',
    'Loved',
    'Hopeful',
    'Content',
    'Relaxed',
    'Satisfied',
    'Pleasant',
    'Nice',
    'Chill',
  ],
  Okay: [
    'Bored',
    'Nostalgic',
    'Creative',
    'Indifferent',
    'Tired',
    'Fine',
    'Quiet',
    'Neutral',
    'Normal',
    'Okay',
  ],
  'Not Good': [
    'Sad',
    'Lonely',
    'Anxious',
    'Stressed',
    'Overwhelmed',
    'Nervous',
    'Down',
    'Irritated',
    'Worried',
    'Uneasy',
  ],
  Bad: [
    'Angry',
    'Furious',
    'Hurt',
    'Frustrated',
    'Exhausted',
    'Upset',
    'Annoyed',
    'Bitter',
    'Crushed',
    'Mad',
  ],
};

export function MoodEntryDrawer({ isOpen, onClose, selectedDate }: MoodEntryDrawerProps) {
  const { setMood, getMood } = useMoodStore();
  const enableNotes = useUserStore((state) => state.moodSettings.enableNotes);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'mood' | 'feeling'>('mood');
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedMood) {
      setStep('feeling');
      const group = TAG_GROUPS[selectedMood.label];
      if (group && group.length > 0) {
        setSelectedTag(group[0]);
      }
    }
  };

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (selectedMood && selectedDate) {
        await setMood(
          selectedDate,
          {
            label: selectedMood.label,
            emoji: selectedMood.emoji,
          },
          selectedTag || undefined,
          enableNotes ? (note ?? getMood(selectedDate)?.note ?? '') : undefined,
        );

        // Reset
        setTimeout(() => {
          setStep('mood');
          setSelectedMood(null);
          setSelectedTag(null);
          setNote(null);
        }, 300);

        onClose();
      }
    } catch {
      toast.error('Could not save your mood. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTimeout(() => setStep('mood'), 300);
        }
      }}
    >
      <DrawerContent className="bg-background border-none text-foreground rounded-t-[2.5rem]">
        <div className="mx-auto w-full max-w-sm px-6 pb-10">
          {step === 'mood' ? (
            <>
              <DrawerHeader className="pt-8 pb-10">
                <DrawerTitle className="text-center text-xl font-bold tracking-tight text-foreground">
                  How is your mood today?
                </DrawerTitle>
              </DrawerHeader>

              <div className="grid grid-cols-3 gap-y-12 mb-16">
                {MOODS.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div
                      className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-all duration-300',
                        selectedMood?.label === mood.label
                          ? 'bg-primary scale-110 shadow-primary/40'
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100',
                      )}
                    >
                      {mood.emoji}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold transition-colors',
                        selectedMood?.label === mood.label ? 'text-primary' : 'text-gray-500',
                      )}
                    >
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={!selectedMood}
                className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/80 border-none text-white shadow-xl shadow-primary/20 disabled:opacity-30 transition-all active:scale-[0.98]"
              >
                I Feel {selectedMood?.label || '...'}!
              </Button>
            </>
          ) : (
            <>
              <DrawerHeader className="pt-8 pb-6">
                <DrawerTitle className="text-center text-xl font-bold tracking-tight text-foreground">
                  {selectedMood?.label}! How would you describe your feelings?
                </DrawerTitle>
              </DrawerHeader>

              <div className="grid grid-cols-3 gap-2 mb-10 overflow-y-auto max-h-[300px] px-1 py-2 no-scrollbar">
                {selectedMood &&
                  TAG_GROUPS[selectedMood.label]?.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                        'h-10 rounded-full px-4 text-xs font-bold transition-all border',
                        selectedTag === tag
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:bg-primary/50',
                      )}
                    >
                      {tag}
                    </button>
                  ))}
              </div>

              {enableNotes && (
                <Field className="mb-4">
                  <FieldLabel htmlFor="mood-note">Reflection (optional)</FieldLabel>
                  <Textarea
                    id="mood-note"
                    maxLength={2000}
                    value={note ?? (selectedDate ? getMood(selectedDate)?.note : undefined) ?? ''}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </Field>
              )}
              <Button
                onClick={handleFinish}
                disabled={!selectedTag || saving}
                className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/80 border-none text-white shadow-xl shadow-primary/20 disabled:opacity-30 transition-all active:scale-[0.98]"
              >
                I Feel {selectedTag}!
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
