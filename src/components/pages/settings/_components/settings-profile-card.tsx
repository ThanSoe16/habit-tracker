'use client';

import React, { useState } from 'react';
import { User, Sun, Moon } from 'lucide-react';
import { useUserStore } from '@/store/use-user-store';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const emojiOptions = ['😊', '⚡', '🔥', '🎯', '🚀', '🧘', '🏋️', '🏃', '💪', '🧠', '🌟', '🏆'];

export function SettingsProfileCard() {
  const { name, avatarEmoji, theme, setName, setAvatarEmoji, setTheme } = useUserStore();
  const [editName, setEditName] = useState(name);

  return (
    <div className="bg-card rounded-3xl p-5 shadow-xs border border-border space-y-4">
      <Flex align="center" gap="2" className="pb-2 border-b border-border">
        <User className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Profile & Appearance
        </h2>
      </Flex>

      <Flex direction="column" gap="2">
        <label className="text-xs font-bold text-foreground">Avatar Icon</label>
        <Flex wrap="wrap" gap="2">
          {emojiOptions.map((emoji) => (
            <Button
              key={emoji}
              variant={avatarEmoji === emoji ? 'default' : 'outline'}
              onClick={() => setAvatarEmoji(emoji)}
              className={`w-10 h-10 rounded-2xl text-xl p-0 ${
                avatarEmoji === emoji ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' : ''
              }`}
            >
              {emoji}
            </Button>
          ))}
        </Flex>
      </Flex>

      <Flex direction="column" gap="1.5">
        <label className="text-xs font-bold text-foreground">Display Name</label>
        <Input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => setName(editName || 'User')}
          placeholder="Your name"
          className="h-12 rounded-2xl bg-muted/50 border-border text-sm font-bold"
        />
      </Flex>

      <Flex direction="column" gap="1.5">
        <label className="text-xs font-bold text-foreground">App Theme</label>
        <Grid columns="2" gap="2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
            className="h-12 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Sun className="w-4 h-4" />
            Light Mode
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
            className="h-12 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Dark Mode
          </Button>
        </Grid>
      </Flex>
    </div>
  );
}
