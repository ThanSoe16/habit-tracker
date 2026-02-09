"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function NewHabitHeader() {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-[32px] font-bold tracking-tight">New habit</h1>
      <Link
        href="/home"
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
      >
        <X className="w-6 h-6 text-gray-800" />
      </Link>
    </header>
  );
}
