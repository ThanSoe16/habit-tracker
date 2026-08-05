'use client';

import React, { useState } from 'react';
import { Menu, BarChart3, PieChart, Mic, Image as ImageIcon, Video, HardDrive, Sparkles, FileText, ArrowUpRight } from 'lucide-react';
import { useMediaStore } from '@/store/use-media-store';
import { StoreSidebarDrawerModal } from '../_components/store-sidebar-drawer-modal';

export default function StoreReportPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { mediaEntries } = useMediaStore();

  const totalFiles = mediaEntries.length;
  const totalSizeBytes = mediaEntries.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  const voiceEntries = mediaEntries.filter((e) => e.type === 'voice');
  const photoEntries = mediaEntries.filter((e) => e.type === 'photo');
  const videoEntries = mediaEntries.filter((e) => e.type === 'video');

  const voiceSize = voiceEntries.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  const photoSize = photoEntries.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  const videoSize = videoEntries.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPct = (size: number) => {
    if (!totalSizeBytes) return 0;
    return Math.round((size / totalSizeBytes) * 100);
  };

  // Find largest file
  const largestFile = [...mediaEntries].sort((a, b) => b.fileSize - a.fileSize)[0];

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
            Storage Report
          </h1>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </header>

        {/* Overview Storage Card */}
        <div className="bg-linear-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-violet-200 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" /> Total Storage Used
            </span>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {totalFiles} Files
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-black">{formatSize(totalSizeBytes)}</h2>
            <p className="text-xs text-violet-200 mt-1 font-medium">
              Synced with Supabase Cloud Storage (media_store)
            </p>
          </div>

          {/* Progress Stack Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${getPct(voiceSize)}%` }}
                className="bg-emerald-400 h-full transition-all duration-500"
                title={`Voice Memos (${getPct(voiceSize)}%)`}
              />
              <div
                style={{ width: `${getPct(photoSize)}%` }}
                className="bg-blue-400 h-full transition-all duration-500"
                title={`Photos (${getPct(photoSize)}%)`}
              />
              <div
                style={{ width: `${getPct(videoSize)}%` }}
                className="bg-rose-400 h-full transition-all duration-500"
                title={`Videos (${getPct(videoSize)}%)`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-extrabold text-violet-200">
              <span>Voice: {getPct(voiceSize)}%</span>
              <span>Photos: {getPct(photoSize)}%</span>
              <span>Videos: {getPct(videoSize)}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown Category Cards */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-600" /> Media Breakdown
          </h3>

          <div className="space-y-3">
            {/* Voice Memos */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Voice Memos</h4>
                  <p className="text-xs text-gray-400 font-medium">{voiceEntries.length} files</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">{formatSize(voiceSize)}</span>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{getPct(voiceSize)}%</p>
              </div>
            </div>

            {/* Photos */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Photos</h4>
                  <p className="text-xs text-gray-400 font-medium">{photoEntries.length} files</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">{formatSize(photoSize)}</span>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{getPct(photoSize)}%</p>
              </div>
            </div>

            {/* Videos */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Videos</h4>
                  <p className="text-xs text-gray-400 font-medium">{videoEntries.length} files</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">{formatSize(videoSize)}</span>
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{getPct(videoSize)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Card */}
        {largestFile && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Storage Insights
            </h3>
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Largest File</p>
                <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">
                  {largestFile.title}
                </p>
              </div>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-full">
                {formatSize(largestFile.fileSize)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <StoreSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
