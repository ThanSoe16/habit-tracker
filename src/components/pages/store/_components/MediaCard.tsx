'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Image as ImageIcon, Video, Trash2, Play, Pause, Maximize2, X } from 'lucide-react';
import { MediaEntry } from '@/store/useMediaStore';
import { cn } from '@/utils/cn';
import { format, parseISO } from 'date-fns';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

interface MediaCardProps {
  entry: MediaEntry;
  onDelete?: (id: string) => void;
  onPlay?: (entry: MediaEntry) => void;
}

export function MediaCard({ entry, onDelete, onPlay }: MediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(entry.duration || 0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toggle audio playback
  const togglePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!audioRef.current) {
      const audio = new Audio(entry.dataUrl);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => console.error('Audio play error:', err));
    }

    if (onPlay) onPlay(entry);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs?: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs) || secs <= 0) return '';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formattedDuration = formatTime(entry.duration || duration);

  return (
    <>
      <div
        onClick={() => {
          if (entry.type === 'voice') {
            togglePlayAudio();
          } else {
            setIsViewerOpen(true);
          }
        }}
        className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          {/* Thumbnail / Play Button */}
          {entry.type === 'voice' ? (
            <button
              type="button"
              onClick={togglePlayAudio}
              className={cn(
                'w-13 h-13 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-md transition-all active:scale-95',
                isPlaying
                  ? 'bg-emerald-600 scale-105 ring-4 ring-emerald-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600',
              )}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white text-white" />
              ) : (
                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
              )}
            </button>
          ) : entry.type === 'photo' ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsViewerOpen(true);
              }}
              className="w-13 h-13 rounded-2xl overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative group/thumb"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.dataUrl}
                alt={entry.title}
                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsViewerOpen(true);
              }}
              className="w-13 h-13 rounded-2xl overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative bg-black flex items-center justify-center group/vid"
            >
              {entry.thumbnailUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.thumbnailUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover opacity-70"
                  />
                  <Play className="w-5 h-5 text-white absolute fill-white" />
                </>
              ) : (
                <Play className="w-6 h-6 text-white fill-white" />
              )}
            </button>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                {entry.title || 'Untitled'}
              </h3>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ml-2',
                  entry.type === 'voice' &&
                    'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
                  entry.type === 'photo' &&
                    'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
                  entry.type === 'video' &&
                    'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
                )}
              >
                {entry.type}
              </span>
            </div>

            <p className="text-xs text-gray-400 font-medium mt-1">
              {format(parseISO(entry.createdAt), 'MMM d, yyyy • hh:mm a')}
            </p>

            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 font-bold">
              <span>{formatFileSize(entry.fileSize)}</span>
              {formattedDuration && <span>• {formattedDuration}</span>}
            </div>
          </div>

          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-700/60 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center shrink-0 transition-colors"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX / MEDIA VIEWER DRAWER */}
      <Drawer open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-black text-white rounded-t-[36px] pb-8 max-h-[90vh] overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-zinc-800 shrink-0">
            <DrawerTitle className="text-sm font-bold text-white truncate max-w-[80%]">
              {entry.title}
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex flex-col items-center justify-center flex-1 min-h-[300px] overflow-auto">
            {entry.type === 'photo' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.dataUrl}
                alt={entry.title}
                className="max-h-[70vh] w-auto rounded-2xl object-contain shadow-2xl"
              />
            )}

            {entry.type === 'video' && (
              <video
                src={entry.dataUrl}
                controls
                autoPlay
                className="max-h-[70vh] w-full rounded-2xl bg-black"
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
