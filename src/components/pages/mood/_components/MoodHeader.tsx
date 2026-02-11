"use client";

import React from "react";
import Link from "next/link";
import { History } from "lucide-react";

export function MoodHeader() {
  return (
    <header className="flex justify-between items-center px-6 py-4">
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
