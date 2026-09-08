'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flex, Box } from '@radix-ui/themes';
import { Dumbbell, GripVertical, HelpCircle, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { PlanExercise } from '@/features/gym/store/model';
import { getExerciseImage } from '@/utils/workout-images';
import { cn } from '@/utils/cn';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';

export function SortablePlanExerciseCard({
  exercise,
  index,
  disabled,
  onGuide,
  onEditSets,
  onDelete,
}: {
  exercise: PlanExercise;
  index: number;
  disabled: boolean;
  onGuide: (name: string) => void;
  onEditSets: (exercise: PlanExercise) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id, disabled });
  const image = getExerciseImage(exercise.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card
      ref={setNodeRef}
      size="sm"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
      }}
      className={cn('relative rounded-2xl', isDragging && 'ring-2 ring-primary shadow-lg')}
    >
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        <Box className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
          {image ? (
            <Image
              src={image}
              alt={exercise.name}
              fill
              unoptimized
              className="object-contain"
              draggable={false}
            />
          ) : (
            <Dumbbell className="size-5 text-primary" />
          )}
        </Box>
        <Flex className="flex min-w-0 flex-1 flex-col gap-1">
          <CardTitle>
            <button
              type="button"
              onClick={() => onGuide(exercise.name)}
              className="inline-flex items-center gap-1 text-left hover:text-primary"
            >
              {exercise.name}
              <HelpCircle className="size-3 shrink-0 text-primary" />
            </button>
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary">{exercise.category}</Badge>
          </CardDescription>
        </Flex>
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 touch-none cursor-grab active:cursor-grabbing"
          disabled={disabled}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${exercise.name}`}
          title="Drag to reorder, or press Space and use arrow keys"
        >
          <GripVertical />
        </Button>
      </CardHeader>
      <CardFooter className="flex-wrap justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {exercise.targetSets} sets × {exercise.targetReps} reps
          {exercise.weight && ` • ${exercise.weight}`}
        </span>
        <Flex className="flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => onEditSets(exercise)}>
            <SlidersHorizontal data-icon="inline-start" />
            Sets & KG
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </Flex>
      </CardFooter>
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Remove ${exercise.name}?`}
        desc="This removes the exercise from this day's plan."
        onPress={() => {
          onDelete(exercise.id);
          setConfirmDelete(false);
        }}
      />
    </Card>
  );
}
