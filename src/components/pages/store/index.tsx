'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Mic, Camera, Image as ImageIcon, Archive, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/store/use-media-store';
import { StoreSidebarDrawerModal } from './_components/store-sidebar-drawer-modal';
import { MediaCard } from './_components/media-card';

export default function StorePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { mediaEntries, deleteMediaEntry, fetchFromSupabase } = useMediaStore();

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  const voiceCount = mediaEntries.filter((e) => e.type === 'voice').length;
  const photoCount = mediaEntries.filter((e) => e.type === 'photo').length;
  const videoCount = mediaEntries.filter((e) => e.type === 'video').length;

  const sortedEntries = [...mediaEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white pb-32">
      <div className="w-full max-w-lg mx-auto p-4 space-y-5">
        {/* Header */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Store Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Media Store
          </h1>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Archive className="w-5 h-5" />
          </div>
        </header>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => router.push('/store/voice')}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold">Voice</span>
            <span className="text-[10px] font-bold text-white/70">{voiceCount} files</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/store/gallery')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold">Photo</span>
            <span className="text-[10px] font-bold text-white/70">{photoCount} files</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/store/gallery')}
            className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold">Video</span>
            <span className="text-[10px] font-bold text-white/70">{videoCount} files</span>
          </button>
        </div>

        {/* All Media Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Recent Media ({mediaEntries.length})
            </h2>
          </div>

          {sortedEntries.length > 0 ? (
            <div className="space-y-3">
              {sortedEntries.map((entry) => (
                <MediaCard
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteMediaEntry}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950/40 rounded-full flex items-center justify-center text-3xl border border-violet-100 dark:border-violet-900/40">
                📦
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-extrabold text-sm">
                  No media stored yet
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Record a voice memo, take a photo, or upload from your gallery
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/store/voice')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" /> Record
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/store/gallery')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/25 transition-all flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Capture
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Drawer */}
      <StoreSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
