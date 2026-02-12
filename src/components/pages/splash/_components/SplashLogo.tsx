'use client';

import React from 'react';
import Image from 'next/image';

export function SplashLogo() {
  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Animated Logo Container */}
      <div className="relative group animate-in fade-in zoom-in duration-1000 ease-out fill-mode-forwards">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-white shadow-2xl overflow-hidden border-4 border-white/50 flex items-center justify-center p-2 transition-transform duration-500 hover:scale-105">
          <Image
            src="/habit-tracker-icon.png"
            alt="Habit Tracker Logo"
            width={160}
            height={160}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Decorative Sparkles (CSS only version of sparkles) */}
        <div className="absolute -top-4 -right-4 animate-bounce delay-100 text-2xl">✨</div>
        <div className="absolute -bottom-2 -left-4 animate-bounce delay-500 text-xl">🌱</div>
      </div>

      {/* Text Section */}
      <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Habit <span className="text-primary">Tracker</span>
        </h1>
        <p className="text-muted-foreground font-medium tracking-wide text-sm opacity-80 uppercase">
          Your path to better habits
        </p>
      </div>
    </div>
  );
}
