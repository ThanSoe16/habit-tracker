"use client";

import React from "react";
import Link from "next/link";
import { History } from "lucide-react";

export function MoodHeader() {
  return (
    <header className="flex justify-between items-center px-6 py-4">
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shadow-sm">
        <div className="w-6 h-6 text-indigo-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      </div>
      <h1 className="text-xl font-bold text-foreground tracking-tight">
        Mood Stat
      </h1>
      <Link
        href="/mood/history"
        className="text-foreground hover:opacity-70 transition-opacity"
      >
        <History className="w-6 h-6" />
      </Link>
    </header>
  );
}
