"use client";

import { Sparkles, EllipsisVertical } from "lucide-react";

export function ReportHeader() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Report</h1>
      </div>
      <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
        <EllipsisVertical className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}
