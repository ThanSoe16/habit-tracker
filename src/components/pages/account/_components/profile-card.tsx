'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store/use-user-store';
import { Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AVATAR_EMOJIS = ['😊', '😎', '🤓', '🦊', '🐱', '🐶', '🌸', '🔥', '⭐', '🎯', '💪', '🧘'];

export function ProfileCard() {
  const { name, avatarEmoji, joinedAt, setName, setAvatarEmoji } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (trimmed) setName(trimmed);
    else setEditName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditName(name);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 shadow-xs border border-border relative">
      <Flex direction="column" align="center">
        {/* Avatar */}
        <Button
          variant="ghost"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 text-5xl mb-4 hover:scale-105 active:scale-95 transition-transform shadow-lg relative p-0"
        >
          {avatarEmoji}
          <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
            <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </Button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Grid columns="6" gap="2" className="bg-card rounded-2xl p-3 shadow-lg border border-border mb-3">
            {AVATAR_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                onClick={() => {
                  setAvatarEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                className={`w-10 h-10 rounded-xl text-2xl p-0 ${
                  avatarEmoji === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''
                }`}
              >
                {emoji}
              </Button>
            ))}
          </Grid>
        )}

        {/* Name */}
        <Flex align="center" gap="2" className="mb-1">
          {isEditing ? (
            <Flex align="center" gap="2">
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="text-xl font-bold text-center border-b-2 border-primary outline-none bg-transparent w-40 py-0.5"
                maxLength={20}
              />
              <Button
                size="icon"
                onClick={handleSave}
                className="w-7 h-7 rounded-full bg-primary"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </Button>
            </Flex>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setEditName(name);
                setIsEditing(true);
              }}
              className="p-0 h-auto font-normal hover:bg-transparent"
            >
              <Flex align="center" gap="2">
                <h2 className="text-xl font-bold text-foreground">{name}</h2>
                <Pencil className="w-4 h-4 text-muted-foreground transition-colors" />
              </Flex>
            </Button>
          )}
        </Flex>

        {/* Member since */}
        <p className="text-xs text-muted-foreground">
          Member since {format(new Date(joinedAt), 'MMMM yyyy')}
        </p>
      </Flex>
    </div>
  );
}

