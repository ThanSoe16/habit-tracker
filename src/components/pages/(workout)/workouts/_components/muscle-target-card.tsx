'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface MuscleTargetCardProps {
  title?: string;
  subtitle?: string;
  activationPercent?: number;
  setsCount?: number;
  statusBadge?: string;
  muscleGroup?: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'abs' | 'legs';
  className?: string;
}

export function MuscleTargetCard({
  title = 'Chest',
  subtitle = 'Pectorals',
  activationPercent = 88,
  setsCount = 4,
  statusBadge = 'Growing',
  muscleGroup = 'chest',
  className,
}: MuscleTargetCardProps) {
  const isChest = muscleGroup === 'chest';
  const isShoulders = muscleGroup === 'shoulders';
  const isAbs = muscleGroup === 'abs';
  const isBiceps = muscleGroup === 'biceps' || muscleGroup === 'triceps';
  const isBack = muscleGroup === 'back';
  const isLegs = muscleGroup === 'legs';

  return (
    <div
      className={cn(
        'bg-slate-50/90 dark:bg-zinc-900/90 rounded-[32px] p-5 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4 max-w-[270px] w-full shrink-0 transition-all hover:shadow-md',
        className,
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 truncate max-w-[90px]">
          {subtitle}
        </span>
      </div>

      {/* Main Illustration White Box (Matching User Reference Image) */}
      <div className="bg-white dark:bg-zinc-800/80 rounded-[28px] p-4 border border-slate-100 dark:border-zinc-700/50 flex flex-col items-center justify-between relative min-h-[230px] shadow-xs">
        {/* Minimalist Mannequin Vector SVG */}
        <div className="w-full flex items-center justify-center py-1">
          <svg viewBox="0 0 200 230" className="w-44 h-44 drop-shadow-xs">
            {/* Head */}
            <circle
              cx="100"
              cy="28"
              r="16"
              className="fill-slate-300 dark:fill-zinc-600 transition-colors"
            />

            {/* Neck Gap */}
            <rect
              x="94"
              y="46"
              width="12"
              height="6"
              rx="1"
              className="fill-white dark:fill-zinc-800"
            />

            {/* Shoulders & Arms Contour */}
            <path
              d="M90,52 C65,52 48,70 52,110 C56,115 68,115 68,105 C66,82 78,72 90,72 Z"
              className={cn(
                'transition-all duration-300',
                isShoulders ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            />
            <path
              d="M110,52 C135,52 152,70 148,110 C144,115 132,115 132,105 C134,82 122,72 110,72 Z"
              className={cn(
                'transition-all duration-300',
                isShoulders ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            />

            {/* CHEST Pectorals (Highlighted in Blue) */}
            <path
              d="M97,54 C72,56 62,80 62,96 C62,104 80,108 97,100 Z"
              className={cn(
                'transition-all duration-300',
                isChest ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            />
            <path
              d="M103,54 C128,56 138,80 138,96 C138,104 120,108 103,100 Z"
              className={cn(
                'transition-all duration-300',
                isChest ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            />

            {/* Bicep / Arm Highlight */}
            {isBiceps && (
              <>
                <circle cx="58" cy="90" r="10" className="fill-blue-500 dark:fill-blue-400" />
                <circle cx="142" cy="90" r="10" className="fill-blue-500 dark:fill-blue-400" />
              </>
            )}

            {/* ABS 6-Pack Grid (Matching Reference Screenshot) */}
            <g
              className={cn(
                'transition-all duration-300',
                isAbs ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            >
              <rect x="86" y="104" width="12" height="14" rx="2" />
              <rect x="102" y="104" width="12" height="14" rx="2" />
              <rect x="86" y="121" width="12" height="14" rx="2" />
              <rect x="102" y="121" width="12" height="14" rx="2" />
              <rect x="86" y="138" width="12" height="14" rx="2" />
              <rect x="102" y="138" width="12" height="14" rx="2" />
            </g>

            {/* LEGS / Lower Body */}
            <path
              d="M72,156 C68,180 65,210 68,220 C76,225 90,215 94,180 L94,156 Z"
              className={cn(
                'transition-all duration-300',
                isLegs ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            />
            <path
              d="M128,156 C132,180 135,210 132,220 C124,225 110,215 106,180 L106,156 Z"
              className={cn(
                'transition-all duration-300',
                isLegs ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-300 dark:fill-zinc-600',
              )}
            />
          </svg>
        </div>

        {/* Stats Row inside inner white card */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100/80 dark:border-zinc-700/50">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 block">
              Activation
            </span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
              {activationPercent}%
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 block">
              Sets
            </span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
              {setsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Status Pill Badge */}
      <div className="flex items-center gap-1.5 bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold w-max">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>{statusBadge}</span>
      </div>

      {/* Thin Progress Bar at bottom */}
      <div className="w-full h-1.5 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, activationPercent))}%` }}
        />
      </div>
    </div>
  );
}
