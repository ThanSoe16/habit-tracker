'use client';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useUserStore, HomeSettings } from '@/store/useUserStore';
import {
  SlidersHorizontal,
  Eye,
  EyeOff,
  ArrowUpDown,
  Layers,
  Flame,
  BarChart2,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface HomeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HomeSettingsModal({ isOpen, onClose }: HomeSettingsModalProps) {
  const { homeSettings, updateHomeSettings } = useUserStore();

  const viewOptions: { id: HomeSettings['homeDefaultView']; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'overall', label: 'Overall' },
  ];

  const cardStyleOptions: { id: HomeSettings['cardStyle']; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'detailed', label: 'Detailed', icon: LayoutGrid },
    { id: 'compact', label: 'Compact', icon: List },
  ];

  const sortOptions: { id: HomeSettings['sortBy']; label: string }[] = [
    { id: 'manual', label: 'Manual Order' },
    { id: 'timeOfDay', label: 'Time of Day' },
    { id: 'status', label: 'Pending First' },
    { id: 'streak', label: 'Top Streak' },
    { id: 'alphabetical', label: 'A – Z' },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-sm px-6 pt-2 pb-10 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-none">
          <DrawerHeader className="p-0 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <DrawerTitle className="text-xl font-black text-gray-900 dark:text-white">
              Home Page Settings
            </DrawerTitle>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Customize your habit view and layout preferences
            </p>
          </DrawerHeader>

          {/* Section 1: Default View Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Default Startup View
            </label>
            <div className="grid grid-cols-3 gap-2">
              {viewOptions.map((opt) => {
                const isSelected = homeSettings.homeDefaultView === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateHomeSettings({ homeDefaultView: opt.id })}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Card Layout Style */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Habit Card Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cardStyleOptions.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = homeSettings.cardStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateHomeSettings({ cardStyle: opt.id })}
                    className={cn(
                      'py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Sort Order */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Sort Habits By
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => {
                const isSelected = homeSettings.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateHomeSettings({ sortBy: opt.id })}
                    className={cn(
                      'py-2 px-3.5 rounded-xl text-xs font-semibold transition-all border',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Toggle Toggles */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
            {/* Group by Time of Day */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Group by Time of Day</p>
                  <p className="text-[11px] text-gray-400">Morning, Afternoon, Evening sections</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.groupByTimeOfDay}
                onChange={(e) => updateHomeSettings({ groupByTimeOfDay: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Hide Completed Habits */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
                  {homeSettings.hideCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Hide Completed Habits</p>
                  <p className="text-[11px] text-gray-400">Only show pending habits for today</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.hideCompleted}
                onChange={(e) => updateHomeSettings({ hideCompleted: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Show Progress Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Show Progress Banner</p>
                  <p className="text-[11px] text-gray-400">Display summary card at the top</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.showProgressBanner}
                onChange={(e) => updateHomeSettings({ showProgressBanner: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Show Streak Badges */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Show Streak Badges</p>
                  <p className="text-[11px] text-gray-400">Display flame counter on cards</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.showStreakBadges}
                onChange={(e) => updateHomeSettings({ showStreakBadges: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
