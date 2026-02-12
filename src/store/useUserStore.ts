"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface UserStore {
  name: string;
  avatarEmoji: string;
  joinedAt: string;
  remindersEnabled: boolean;
  theme: Theme;
  setName: (name: string) => void;
  setAvatarEmoji: (emoji: string) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: "User",
      avatarEmoji: "😊",
      joinedAt: new Date().toISOString(),
      remindersEnabled: false,
      theme: "light" as Theme,

      setName: (name) => set({ name }),
      setAvatarEmoji: (emoji) => set({ avatarEmoji: emoji }),
      setRemindersEnabled: (enabled) => set({ remindersEnabled: enabled }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "user-profile-storage",
    },
  ),
);
