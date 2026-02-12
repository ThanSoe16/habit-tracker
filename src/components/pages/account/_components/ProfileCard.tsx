'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';

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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center relative">
      {/* Avatar */}
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl mb-4 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-indigo-100/50 relative"
      >
        {avatarEmoji}
        <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center shadow-md">
          <Pencil className="w-3.5 h-3.5 text-white" />
        </div>
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="grid grid-cols-6 gap-2 bg-white rounded-2xl p-3 shadow-lg border border-gray-100 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setAvatarEmoji(emoji);
                setShowEmojiPicker(false);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl hover:bg-gray-100 transition-colors ${
                avatarEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-300' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Name */}
      <div className="flex items-center gap-2 mb-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-xl font-bold text-center border-b-2 border-indigo-400 outline-none bg-transparent w-40 py-0.5"
              maxLength={20}
            />
            <button
              onClick={handleSave}
              className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditName(name);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 group"
          >
            <h2 className="text-xl font-bold text-foreground">{name}</h2>
            <Pencil className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
          </button>
        )}
      </div>

      {/* Member since */}
      <p className="text-xs text-muted-foreground">
        Member since {format(new Date(joinedAt), 'MMMM yyyy')}
      </p>
    </div>
  );
}
