'use client';

import React from 'react';
import { Mic, Image as ImageIcon, Video, Trash2, Play, Pause } from 'lucide-react';
import { MediaEntry } from '@/store/useMediaStore';
import { cn } from '@/utils/cn';
import { format, parseISO } from 'date-fns';

interface MediaCardProps {
  entry: MediaEntry;
  onDelete?: (id: string) => void;
  onPlay?: (entry: MediaEntry) => void;
}

export function MediaCard({ entry, onDelete, onPlay }: MediaCardProps) {
  const typeIcons = {
    voice: Mic,
    photo: ImageIcon,
    video: Video,
  };

  const typeColors = {
    voice: 'bg-emerald-500',
    photo: 'bg-blue-500',
    video: 'bg-rose-500',
  };

  const typeBadgeColors = {
    voice: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
    photo: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
    video: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
  };

  const IconComp = typeIcons[entry.type];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50 hover:border-violet-200 dark:hover:border-violet-900 transition-all group">
      <div className="flex items-start gap-3.5">
        {/* Thumbnail or Icon */}
        {entry.type === 'photo' ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.dataUrl}
              alt={entry.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : entry.type === 'video' ? (
          <button
            type="button"
            onClick={() => onPlay?.(entry)}
            className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative bg-black flex items-center justify-center"
          >
            {entry.thumbnailUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.thumbnailUrl}
                  alt={entry.title}
                  className="w-full h-full object-cover opacity-70"
                />
                <Play className="w-5 h-5 text-white absolute" />
              </>
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPlay?.(entry)}
            className={cn(
              'w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white shadow-md',
              typeColors[entry.type],
            )}
          >
            <IconComp className="w-6 h-6" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
              {entry.title || 'Untitled'}
            </h3>
            <span className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ml-2',
              typeBadgeColors[entry.type],
            )}>
              {entry.type}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-xs text-gray-400 font-medium">
              {format(parseISO(entry.createdAt), 'MMM d, yyyy • hh:mm a')}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-gray-400 font-bold">
              {formatFileSize(entry.fileSize)}
            </span>
            {entry.duration != null && entry.duration > 0 && (
              <span className="text-[11px] text-gray-400 font-bold">
                {formatDuration(entry.duration)}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-950/60"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
