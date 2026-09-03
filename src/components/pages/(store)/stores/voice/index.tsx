'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Save, Trash2 } from 'lucide-react';
import { useMediaStore, MediaEntry } from '@/store/use-media-store';
import { uploadMediaToStorage } from '@/features/media/services/supabase';
import { MediaCard } from '../../_components/media-card';
import { cn } from '@/utils/cn';

export default function StoreVoicePage() {
  const { mediaEntries, addMediaEntry, deleteMediaEntry } = useMediaStore();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Preview state
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  const voiceEntries = mediaEntries
    .filter((e) => e.type === 'voice')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionGranted(true);
      return true;
    } catch {
      setPermissionGranted(false);
      return false;
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (recordedBlob) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } catch {
      setPermissionGranted(false);
    }
  }, [recordedBlob]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const [memoTitle, setMemoTitle] = useState('');

  // Discard recording
  const discardRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setMemoTitle('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [recordedUrl]);

  // Save recording
  const saveRecording = useCallback(async () => {
    if (!recordedBlob || !recordedUrl) return;

    const storageUrl = await uploadMediaToStorage(recordedBlob, 'voice_memo.webm');

    const title =
      memoTitle.trim() ||
      `Voice Memo ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    const entry: MediaEntry = {
      id: crypto.randomUUID(),
      type: 'voice',
      title,
      dataUrl: storageUrl || recordedUrl,
      fileSize: recordedBlob.size,
      duration: recordingTime,
      mimeType: recordedBlob.type || 'audio/webm',
      createdAt: new Date().toISOString(),
    };

    addMediaEntry(entry);
    discardRecording();
  }, [recordedBlob, recordedUrl, recordingTime, memoTitle, addMediaEntry, discardRecording]);

  // Play/pause preview
  const togglePlayback = useCallback(() => {
    if (!recordedUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(recordedUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    }
  }, [recordedUrl, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play a saved voice entry
  const handlePlayEntry = useCallback((entry: MediaEntry) => {
    const audio = new Audio(entry.dataUrl);
    audio.play();
  }, []);

  return (
    <div className="space-y-5">
      {/* Recording Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-600/20 space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <p className="text-4xl font-black tracking-tight tabular-nums">
            {formatTime(recordingTime)}
          </p>
          <p className="text-xs font-bold text-emerald-200 mt-1">
            {isRecording ? '🔴 Recording...' : recordedBlob ? 'Preview ready' : 'Hold to record'}
          </p>
        </div>

        {/* Waveform Animation */}
        <div className="flex items-center justify-center gap-1 h-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1 bg-white/60 rounded-full transition-all duration-150',
                isRecording ? 'animate-pulse' : 'h-1',
              )}
              style={{
                height: isRecording ? `${Math.random() * 40 + 8}px` : '4px',
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>

        {/* Record Button */}
        {!recordedBlob ? (
          <div className="flex flex-col items-center gap-3">
            {permissionGranted === false ? (
              <div className="text-center space-y-2">
                <MicOff className="w-8 h-8 mx-auto text-red-300" />
                <p className="text-xs font-bold text-red-200">
                  Microphone permission denied
                </p>
                <button
                  type="button"
                  onClick={requestPermission}
                  className="px-4 py-2 bg-white/20 rounded-xl text-xs font-bold hover:bg-white/30 transition-colors"
                >
                  Request Again
                </button>
              </div>
            ) : (
              <button
                type="button"
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={isRecording ? stopRecording : undefined}
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl',
                  isRecording
                    ? 'bg-red-500 scale-110 shadow-red-500/40 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 border-2 border-white/30 hover:scale-105 active:scale-95',
                )}
              >
                {isRecording ? (
                  <Square className="w-7 h-7 text-white fill-current" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            )}
            <p className="text-[11px] font-bold text-emerald-200/80">
              {isRecording ? 'Release to stop' : 'Press and hold to record'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 w-full max-w-xs mx-auto">
            <input
              type="text"
              value={memoTitle}
              onChange={(e) => setMemoTitle(e.target.value)}
              placeholder="Enter voice memo name..."
              className="w-full px-4 py-2.5 bg-black/20 text-white placeholder-emerald-100/60 rounded-2xl text-xs font-bold border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-center shadow-inner"
            />

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={discardRecording}
                className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                title="Discard"
              >
                <Trash2 className="w-5 h-5 text-red-300" />
              </button>

              <button
                type="button"
                onClick={togglePlayback}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={saveRecording}
                className="w-12 h-12 rounded-full bg-emerald-400/30 hover:bg-emerald-400/50 flex items-center justify-center transition-colors"
                title="Save"
              >
                <Save className="w-5 h-5 text-emerald-200" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Memos List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-600" /> Saved Voice Memos ({voiceEntries.length})
          </h2>
        </div>

        {voiceEntries.length > 0 ? (
          <div className="space-y-3">
            {voiceEntries.map((entry) => (
              <MediaCard
                key={entry.id}
                entry={entry}
                onDelete={deleteMediaEntry}
                onPlay={handlePlayEntry}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-6">
            No voice memos yet. Hold the record button above to start!
          </p>
        )}
      </div>
    </div>
  );
}
