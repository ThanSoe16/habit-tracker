"use client";

import React from "react";

interface HomeHeaderProps {
  greeting: string;
  name: string;
  avatarEmoji: string;
  formattedDate: string;
}

export function HomeHeader({
  greeting,
  name,
  avatarEmoji,
  formattedDate,
}: HomeHeaderProps) {
  return (
    <header className="flex justify-between items-start px-2">
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground leading-none">
          {greeting}, {name}
        </h1>
        <p className="text-gray-500 text-sm font-medium">{formattedDate}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
        {avatarEmoji}
      </div>
    </header>
  );
}
