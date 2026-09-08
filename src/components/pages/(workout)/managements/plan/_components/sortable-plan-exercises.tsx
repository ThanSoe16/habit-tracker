'use client';

import { useId } from 'react';
import { Flex } from '@radix-ui/themes';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { PlanExercise } from '@/features/gym/store/model';
import { SortablePlanExerciseCard } from './sortable-plan-exercise-card';

export function SortablePlanExercises({
  exercises,
  onReorder,
  onGuide,
  onEditSets,
  onDelete,
}: {
  exercises: PlanExercise[];
  onReorder: (activeId: string, overId: string) => void;
  onGuide: (name: string) => void;
  onEditSets: (exercise: PlanExercise) => void;
  onDelete: (id: string) => void;
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={exercises.map((exercise) => exercise.id)}
        strategy={verticalListSortingStrategy}
      >
        <Flex className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">Drag the handles to reorder exercises.</p>
          {exercises.map((exercise, index) => (
            <SortablePlanExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              disabled={exercises.length < 2}
              onGuide={onGuide}
              onEditSets={onEditSets}
              onDelete={onDelete}
            />
          ))}
        </Flex>
      </SortableContext>
    </DndContext>
  );
}
