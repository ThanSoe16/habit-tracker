'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scale,
  Trash2,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Plus,
  Target,
  Flame,
} from 'lucide-react';
import { useGymStore, kgToLbs, cmToFtIn } from '@/store/use-gym-store';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function GymBodyMetricsHistoryPage() {
  const router = useRouter();
  const { bodyMetricLogs, deleteBodyMetricLog, gymSettings, addBodyMetricLog } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';
  const weightUnitLabel = isLbs ? 'lbs' : 'kg';
  const displayWeight = (kg: number) => (isLbs ? kgToLbs(kg) : kg);

  // Group logs by Month (YYYY-MM)
  const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Quick log dialog
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickWeight, setQuickWeight] = useState(
    isLbs ? kgToLbs(gymSettings.currentWeightKg || 75) : gymSettings.currentWeightKg || 75,
  );
  const [quickFat, setQuickFat] = useState(gymSettings.bodyFatPct || 18);

  // Delete dialog state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract all available months from logs and ensure current month is in list
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentMonthKey);
    bodyMetricLogs.forEach((log) => {
      if (log.logged_at) {
        const m = log.logged_at.slice(0, 7);
        if (m) monthSet.add(m);
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [bodyMetricLogs, currentMonthKey]);

  // Filter logs for the selected month
  const monthlyLogs = useMemo(() => {
    return bodyMetricLogs
      .filter((log) => log.logged_at && log.logged_at.startsWith(selectedMonth))
      .sort((a, b) => (b.logged_at > a.logged_at ? 1 : -1));
  }, [bodyMetricLogs, selectedMonth]);

  // Monthly statistics
  const monthlyStats = useMemo(() => {
    if (monthlyLogs.length === 0) {
      return {
        count: 0,
        startWeight: 0,
        endWeight: 0,
        diff: 0,
        avgWeight: 0,
        avgFat: 0,
      };
    }

    // Earliest and latest in this month
    const chronological = [...monthlyLogs].reverse();
    const startWeight = chronological[0].weight_kg;
    const endWeight = chronological[chronological.length - 1].weight_kg;
    const diff = Math.round((endWeight - startWeight) * 10) / 10;

    const totalWeight = monthlyLogs.reduce((acc, l) => acc + l.weight_kg, 0);
    const avgWeight = Math.round((totalWeight / monthlyLogs.length) * 10) / 10;

    const fatLogs = monthlyLogs.filter((l) => l.body_fat_pct);
    const avgFat =
      fatLogs.length > 0
        ? Math.round(
            (fatLogs.reduce((acc, l) => acc + (l.body_fat_pct || 0), 0) / fatLogs.length) * 10,
          ) / 10
        : 0;

    return {
      count: monthlyLogs.length,
      startWeight,
      endWeight,
      diff,
      avgWeight,
      avgFat,
    };
  }, [monthlyLogs]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const formatMonthTitle = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await deleteBodyMetricLog(deletingId);
    toast.success('Body metric log deleted');
    setDeletingId(null);
  };

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString('en-CA');
    const weightKg = isLbs ? Number((quickWeight / 2.20462).toFixed(1)) : Number(quickWeight);

    await addBodyMetricLog({
      logged_at: todayStr,
      height_cm: gymSettings.heightCm || 175,
      weight_kg: weightKg,
      target_weight_kg: gymSettings.targetWeightKg || 70,
      dob: gymSettings.dob,
      gender: gymSettings.gender,
      fitness_goal: gymSettings.fitnessGoal,
      body_fat_pct: quickFat ? Number(quickFat) : undefined,
    });
    setIsQuickLogOpen(false);
    toast.success('New metric entry added!');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white space-y-4 pb-16">
      {/* Quick Add Metric Drawer */}
      {isQuickLogOpen && (
        <form
          onSubmit={handleQuickLog}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-blue-100 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" /> Log Today&apos;s Entry
            </h3>
            <button
              type="button"
              onClick={() => setIsQuickLogOpen(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Weight ({weightUnitLabel})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={quickWeight}
                onChange={(e) => setQuickWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Body Fat (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={quickFat}
                onChange={(e) => setQuickFat(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Save Entry to {formatMonthTitle(currentMonthKey)}
          </button>
        </form>
      )}

      {/* 1. Month Selector Navigation */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-gray-900 dark:text-white">
              {formatMonthTitle(selectedMonth)}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Monthly Summary Overview Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            <h3 className="font-extrabold text-base">{formatMonthTitle(selectedMonth)} Overview</h3>
          </div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {monthlyStats.count} {monthlyStats.count === 1 ? 'Entry' : 'Entries'} Logged
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">
              Start Weight
            </p>
            <p className="text-base font-black">
              {monthlyStats.count > 0 ? displayWeight(monthlyStats.startWeight) : '--'}{' '}
              <span className="text-xs font-bold">{weightUnitLabel}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">
              End Weight
            </p>
            <p className="text-base font-black">
              {monthlyStats.count > 0 ? displayWeight(monthlyStats.endWeight) : '--'}{' '}
              <span className="text-xs font-bold">{weightUnitLabel}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">
              Net Change
            </p>
            <p className="text-base font-black">
              {monthlyStats.count > 0
                ? `${monthlyStats.diff > 0 ? '+' : ''}${displayWeight(monthlyStats.diff)}`
                : '--'}{' '}
              <span className="text-xs font-bold">{weightUnitLabel}</span>
            </p>
          </div>
        </div>

        {monthlyStats.count > 0 && (
          <div className="flex items-center justify-between bg-black/20 rounded-2xl p-3 border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              {monthlyStats.diff < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-300" />
              ) : monthlyStats.diff > 0 ? (
                <TrendingUp className="w-4 h-4 text-amber-300" />
              ) : (
                <Scale className="w-4 h-4 text-blue-200" />
              )}
              <span className="font-bold">
                Avg Weight: {displayWeight(monthlyStats.avgWeight)} {weightUnitLabel}
              </span>
            </div>

            {monthlyStats.avgFat > 0 && (
              <span className="font-semibold text-blue-200">Avg Fat: {monthlyStats.avgFat}%</span>
            )}
          </div>
        )}
      </div>

      {/* 3. Monthly Entries List */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 px-1 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          {formatMonthTitle(selectedMonth)} • {monthlyLogs.length} Records
        </h2>

        {monthlyLogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 text-center space-y-3">
            <Scale className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs font-bold text-gray-400">
              No logs in {formatMonthTitle(selectedMonth)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {monthlyLogs.map((log, idx) => {
              const heightDetails = log.height_cm ? cmToFtIn(log.height_cm) : null;
              const prevLog = idx < monthlyLogs.length - 1 ? monthlyLogs[idx + 1] : null;
              const delta = prevLog ? Math.round((log.weight_kg - prevLog.weight_kg) * 10) / 10 : null;
              const dayNum = log.logged_at?.split('-')[2] || '--';
              const dayName = log.logged_at
                ? new Date(log.logged_at + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })
                : '';

              return (
                <div
                  key={log.id || log.logged_at}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-gray-100 dark:border-zinc-800 flex items-center gap-3 group hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors"
                >
                  {/* Date Column */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700">
                    <span className="text-base font-black text-gray-900 dark:text-white leading-none">{dayNum}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{dayName}</span>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-gray-900 dark:text-white">
                        {displayWeight(log.weight_kg)}
                      </span>
                      <span className="text-xs font-bold text-gray-400">{weightUnitLabel}</span>
                      {delta !== null && delta !== 0 && (
                        <span className={cn(
                          'text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ml-1',
                          delta < 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                            : 'bg-red-50 dark:bg-red-950/40 text-red-500'
                        )}>
                          {delta > 0 ? '+' : ''}{displayWeight(delta)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {log.height_cm && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          {log.height_cm}cm
                          {heightDetails && ` (${heightDetails.feet}'${heightDetails.inches}")`}
                        </span>
                      )}
                      {log.body_fat_pct && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          • {log.body_fat_pct}% fat
                        </span>
                      )}
                      {log.fitness_goal && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
                          {log.fitness_goal}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  {log.id && (
                    <button
                      type="button"
                      onClick={() => setDeletingId(log.id!)}
                      className="p-2 rounded-xl text-gray-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deleting Log */}
      <ConfirmationDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Body Metric Log"
        desc="Are you sure you want to delete this recorded metric entry? This action cannot be undone."
        isDelete={true}
        enableDeleteIcon={true}
        confirmText="Delete Entry"
        onPress={handleConfirmDelete}
      />
    </div>
  );
}
