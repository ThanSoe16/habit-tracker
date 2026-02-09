"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HomeHeaderProps {
  greeting: string;
  name: string;
  formattedDate: string;
}

export function HomeHeader({ greeting, name, formattedDate }: HomeHeaderProps) {
  return (
    <header className="flex justify-between items-start px-2">
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground leading-none">
          {greeting}, {name}
        </h1>
        <p className="text-gray-500 text-sm font-medium">{formattedDate}</p>
      </div>
      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
        <AvatarImage
          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${name}&backgroundColor=transparent`}
          alt={name}
        />
        <AvatarFallback className="bg-secondary text-primary font-bold">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
