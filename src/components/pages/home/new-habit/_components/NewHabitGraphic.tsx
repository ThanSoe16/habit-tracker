"use client";

import React from "react";
import { Calendar } from "lucide-react";

export function NewHabitGraphic() {
  return (
    <div className="flex justify-center mb-10">
      {/* Illustration */}
      <div className="relative w-32 h-32">
        {/* Simple CSS representation or icon */}
        <Calendar
          className="w-32 h-32 text-[#8BC34A] fill-[#DCEDC8]"
          strokeWidth={1.5}
        />
        {/* Decorative squiggles could be SVGs */}
      </div>
    </div>
  );
}
