'use client';

import { useRouter } from 'next/navigation';
import { Scale, Trash2, Calendar } from 'lucide-react';
import { useGymStore } from '@/store/use-gym-store';

export default function GymBodyMetricsHistoryPage() {
  const router = useRouter();
  const { bodyMetricLogs, deleteBodyMetricLog, gymSettings } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';
  const weightUnitLabel = isLbs ? 'lbs' : 'kg';
  const displayWeight = (kg: number) => (isLbs ? Math.round(kg * 2.20462) : kg);

  const logs = bodyMetricLogs.slice().reverse();

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white">
      {/* History Log List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" /> Recorded Metric Entries ({logs.length})
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-500">No body metric logs recorded yet</p>
            <button
              type="button"
              onClick={() => router.push('/workout/personal-info')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Log First Metric Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id || log.logged_at}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm shadow-primary/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {displayWeight(log.weight_kg)} {weightUnitLabel} • {log.height_cm} cm
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {log.logged_at} {log.body_fat_pct ? `• ${log.body_fat_pct}% body fat` : ''}
                    </p>
                  </div>
                </div>

                {log.id && (
                  <button
                    type="button"
                    onClick={() => deleteBodyMetricLog(log.id!)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
