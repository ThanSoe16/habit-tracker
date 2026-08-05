'use client';

import React, { useState } from 'react';
import { Menu, Settings, HardDrive, CheckCircle2, ShieldCheck, RefreshCw, Trash2, Cloud, Camera, Mic } from 'lucide-react';
import { useMediaStore } from '@/store/use-media-store';
import { StoreSidebarDrawerModal } from '../_components/store-sidebar-drawer-modal';

export default function StoreSettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { mediaEntries, fetchFromSupabase } = useMediaStore();

  const handleRefresh = async () => {
    setIsClearing(true);
    await fetchFromSupabase();
    setTimeout(() => setIsClearing(false), 500);
  };

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
            Store Settings
          </h1>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Settings className="w-5 h-5" />
          </div>
        </header>

        {/* Supabase Storage Integration Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Cloud Storage Bucket</h3>
              <p className="text-xs text-gray-400 font-medium">Supabase Bucket: <strong className="text-emerald-600 dark:text-emerald-400">media_store</strong></p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Public Storage Policies Enabled</span>
            </div>
            <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
          </div>
        </div>

        {/* Media Preferences Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Capture Preferences
          </h3>

          <div className="space-y-3">
            {/* Audio Recording Format */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">Audio Format</h4>
                  <p className="text-[11px] text-gray-400 font-medium">WebM / Opus Codec</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-zinc-700 px-2.5 py-1 rounded-lg">High Quality</span>
            </div>

            {/* Photo / Video Storage */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">Camera Mode</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Auto Switch Front / Rear</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-zinc-700 px-2.5 py-1 rounded-lg">1080p Full HD</span>
            </div>
          </div>
        </div>

        {/* Sync & Management Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Storage Actions
          </h3>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isClearing}
            className="w-full py-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/60 font-bold text-xs border border-violet-100 dark:border-violet-900/50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? 'Re-syncing...' : 'Re-sync from Supabase Cloud'}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <StoreSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
