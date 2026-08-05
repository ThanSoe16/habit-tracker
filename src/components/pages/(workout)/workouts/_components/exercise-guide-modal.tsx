'use client';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { getExerciseGuide } from '@/utils/exercise-guide-data';
import { Dumbbell, Lightbulb, ExternalLink, Target, CheckCircle2 } from 'lucide-react';

interface ExerciseGuideModalProps {
  exerciseName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseGuideModal({
  exerciseName,
  isOpen,
  onClose,
}: ExerciseGuideModalProps) {
  if (!exerciseName) return null;

  const guide = getExerciseGuide(exerciseName);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${guide.name} exercise form tutorial`
  )}`;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background rounded-t-[2.5rem] max-h-[85vh] overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-md flex flex-col h-full overflow-y-auto no-scrollbar px-6 pb-8 pt-2">
          {/* Top Header */}
          <DrawerHeader className="p-0 pb-3 text-center border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {guide.category}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                {guide.difficulty}
              </span>
            </div>

            <DrawerTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
              {guide.name} <Dumbbell className="w-5 h-5 text-blue-600 shrink-0" />
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-5 pt-4">
            {/* Quick Meta Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-blue-500" /> Target Muscles
                </span>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {guide.targetMuscles.join(', ')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-indigo-500" /> Equipment
                </span>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {guide.equipment}
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs font-medium text-blue-900 dark:text-blue-200">
              {guide.summary}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Step-by-Step How-To
              </h4>

              <ol className="space-y-2.5">
                {guide.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Pro Form Tips */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Pro Form Tips
              </h4>
              <ul className="space-y-1.5 pl-1">
                {guide.proTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-amber-900 dark:text-amber-200 font-medium flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* YouTube Search Video Button */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-98 transition-all"
            >
              <span>Watch Form Guide Video on YouTube 🎥</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
