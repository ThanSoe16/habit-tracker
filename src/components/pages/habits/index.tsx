'use client';

import React, { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/use-habit-store';
import { MyHabitCard } from './_components/my-habit-card';
import { cn } from '@/utils/cn';
import { Menu, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SidebarDrawerModal } from '@/components/pages/home/_components/sidebar-drawer-modal';
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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { habits, reorderHabits } = useHabitStore();
  const [activeTab, setActiveTab] = useState<'habit' | 'task'>(tabParam === 'task' ? 'task' : 'habit');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (tabParam === 'task' || tabParam === 'habit') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'habit' | 'task') => {
    setActiveTab(tab);
    router.push(`/habits?tab=${tab}`);
  };

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
    <div className="min-h-screen bg-background dark:bg-zinc-950 flex flex-col w-full max-w-lg mx-auto pb-28">
      {/* Header matching HomeHeader layout */}
      <header className="flex justify-between items-center px-4 py-3">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
          title="Open Habit Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
          {activeTab === 'task' ? 'One-Time Tasks' : 'Regular Habits'}
        </h1>

        <div className="w-10 h-10" />
      </header>

      {/* Habit List */}
      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto no-scrollbar pb-32">
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
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-3xl">
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
          type="button"
          onClick={() => router.push('/habits/create')}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 flex items-center justify-center border-2 border-white dark:border-zinc-900 transition-all active:scale-95 hover:scale-105 text-white"
          title="Create habit"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      {/* Navigation Sidebar Drawer */}
      <SidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
