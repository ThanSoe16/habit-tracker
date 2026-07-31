'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { MyHabitCard } from './_components/MyHabitCard';
import { cn } from '@/utils/cn';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export default function MyHabitsPage() {
  const router = useRouter();
  const { habits, reorderHabits } = useHabitStore();
  const [activeTab, setActiveTab] = useState<'habit' | 'task'>('habit');

  const filteredHabits = habits.filter((h) => {
    const type = h.type || 'habit';
    return type === activeTab;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(habits, oldIndex, newIndex);
      reorderHabits(reordered);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 flex flex-col w-full max-w-lg mx-auto pb-28">
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-6 pb-2">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Habits</h1>
      </header>

      {/* Segmented Control */}
      <div className="px-6 py-2">
        <div className="bg-gray-200/70 dark:bg-zinc-800 p-1.5 rounded-2xl flex">
          <button
            onClick={() => setActiveTab('habit')}
            className={cn(
              'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
              activeTab === 'habit'
                ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800',
            )}
          >
            Regular Habit
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={cn(
              'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
              activeTab === 'task'
                ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800',
            )}
          >
            One-Time Task
          </button>
        </div>
      </div>

      {/* Habit List */}
      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto no-scrollbar pb-32">
        {filteredHabits.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredHabits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredHabits.map((habit) => (
                  <MyHabitCard
                    key={habit.id}
                    habit={habit}
                    onClick={() => router.push(`/habits/${habit.id}`)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
              🍃
            </div>
            <div>
              <p className="text-gray-500 font-bold">No {activeTab}s yet</p>
              <p className="text-gray-400 text-sm mt-1">Start by adding a new one!</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => router.push('/habits/create')}
          className="w-14 h-14 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] shadow-xl shadow-blue-500/30 flex items-center justify-center border-2 border-white dark:border-zinc-900 transition-all active:scale-95 hover:scale-105 text-white"
          title="Create habit"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
