"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoCard() {
  return (
    <div className="relative overflow-hidden bg-secondary rounded-xl p-5 pr-4 shadow-sm h-40 flex flex-col justify-center">
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-foreground">
            Set the reminder
          </h3>
          <p className="text-xs text-muted-foreground max-w-48 leading-relaxed font-medium">
            Never miss your morning routine! Set a reminder to stay on track.
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full px-6 h-10 font-bold bg-[#5D4037] text-white hover:bg-black/80 border-none shadow-lg text-xs tracking-wide"
        >
          Set Now
        </Button>
      </div>

      {/* Decorative Bell - Positioned exactly like screenshot */}
      <div className="absolute -right-10 bottom-[-20px] rotate-[-5deg] z-0 pointer-events-none select-none">
        <Bell className="w-48 h-48 fill-primary text-primary drop-shadow-2xl" />
      </div>
    </div>
  );
}
