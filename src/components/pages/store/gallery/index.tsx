'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Menu, Camera, Image as ImageIcon, Video, Upload, X, Check, SwitchCamera, Aperture } from 'lucide-react';
import { useMediaStore, MediaEntry } from '@/store/useMediaStore';
import { uploadMediaToStorage } from '@/lib/supabase/services';
import { StoreSidebarDrawerModal } from '../_components/StoreSidebarDrawerModal';
import { MediaCard } from '../_components/MediaCard';
import { cn } from '@/utils/cn';

export default function StoreGalleryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { mediaEntries, addMediaEntry, deleteMediaEntry } = useMediaStore();

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewType, setPreviewType] = useState<'photo' | 'video'>('photo');

  const galleryRef = useRef<HTMLInputElement>(null);

  const galleryEntries = mediaEntries
    .filter((e) => e.type === 'photo' || e.type === 'video')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Open camera
  const openCamera = useCallback(async (mode: 'photo' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      });
      streamRef.current = stream;
      setCameraMode(mode);
      setIsCameraOpen(true);

      // Attach stream to video element after render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      alert('Camera permission is required. Please allow camera access in your browser settings.');
    }
  }, [facingMode]);

  // Close camera
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    setIsCameraOpen(false);
    setIsVideoRecording(false);
    setVideoRecordingTime(0);
  }, []);

  // Switch front/back camera
  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: cameraMode === 'video',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      // fallback silently
    }
  }, [facingMode, cameraMode]);

  // Take photo snapshot
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewBlob(blob);
      setPreviewType('photo');
      closeCamera();
    }, 'image/jpeg', 0.92);
  }, [closeCamera]);

  // Start video recording
  const startVideoRecording = useCallback(() => {
    if (!streamRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    videoChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewBlob(blob);
      setPreviewType('video');
      closeCamera();
    };

    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setIsVideoRecording(true);
    setVideoRecordingTime(0);

    const startTime = Date.now();
    videoTimerRef.current = setInterval(() => {
      setVideoRecordingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
  }, [closeCamera]);

  // Stop video recording
  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      if (videoTimerRef.current) {
        clearInterval(videoTimerRef.current);
        videoTimerRef.current = null;
      }
    }
  }, [isVideoRecording]);

  // Handle gallery file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFile(file);
    setPreviewBlob(null);
    setPreviewType(isVideo ? 'video' : 'photo');
    e.target.value = '';
  }, []);

  const [mediaTitle, setMediaTitle] = useState('');

  // Discard preview
  const discardPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
    setPreviewBlob(null);
    setMediaTitle('');
  }, [previewUrl]);

  // Save the previewed file
  const saveFile = useCallback(async () => {
    const source = previewFile || previewBlob;
    if (!source || !previewUrl) return;

    const filename = (source as File).name || `${previewType}.${previewType === 'photo' ? 'jpg' : 'mp4'}`;
    const storageUrl = await uploadMediaToStorage(source, filename);

    const defaultTitle = `${previewType === 'video' ? 'Video' : 'Photo'} ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    const title = mediaTitle.trim() || defaultTitle;

    const entry: MediaEntry = {
      id: crypto.randomUUID(),
      type: previewType,
      title,
      dataUrl: storageUrl || previewUrl,
      fileSize: source.size,
      duration: previewType === 'video' ? videoRecordingTime : 0,
      mimeType: source.type || (previewType === 'photo' ? 'image/jpeg' : 'video/webm'),
      createdAt: new Date().toISOString(),
    };

    addMediaEntry(entry);
    discardPreview();
  }, [previewFile, previewBlob, previewUrl, previewType, videoRecordingTime, mediaTitle, addMediaEntry, discardPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-gray-900 dark:text-white pb-32">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden gallery file input */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Live Camera Viewfinder */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          {/* Camera Feed */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Video recording timer */}
            {isVideoRecording && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-black tabular-nums">
                  {formatTime(videoRecordingTime)}
                </span>
              </div>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={closeCamera}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Controls */}
          <div className="bg-black/90 backdrop-blur-md px-6 py-6 flex items-center justify-between">
            {/* Switch camera */}
            <button
              type="button"
              onClick={switchCamera}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title="Switch Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* Shutter / Record */}
            {cameraMode === 'photo' ? (
              <button
                type="button"
                onClick={takePhoto}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                title="Take Photo"
              >
                <div className="w-14 h-14 bg-white rounded-full" />
              </button>
            ) : (
              <button
                type="button"
                onClick={isVideoRecording ? stopVideoRecording : startVideoRecording}
                className={cn(
                  'w-18 h-18 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all',
                )}
                title={isVideoRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isVideoRecording ? (
                  <div className="w-8 h-8 bg-red-500 rounded-md" />
                ) : (
                  <div className="w-14 h-14 bg-red-500 rounded-full" />
                )}
              </button>
            )}

            {/* Mode toggle */}
            <button
              type="button"
              onClick={() => setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title={cameraMode === 'photo' ? 'Switch to Video' : 'Switch to Photo'}
            >
              {cameraMode === 'photo' ? <Video className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

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
            Photos & Videos
          </h1>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <ImageIcon className="w-5 h-5" />
          </div>
        </header>

        {/* Preview Modal */}
        {previewUrl && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-lg border border-violet-200 dark:border-violet-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Preview
              </h2>
              <button
                type="button"
                onClick={discardPreview}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-black">
              {previewType === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-60 object-contain"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-60 object-contain"
                />
              )}
            </div>

            {/* Name / Title Input */}
            <input
              type="text"
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder={`Enter ${previewType === 'video' ? 'video' : 'photo'} name...`}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={discardPreview}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Discard
              </button>
              <button
                type="button"
                onClick={saveFile}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => openCamera('photo')}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold">Take Photo</span>
          </button>

          <button
            type="button"
            onClick={() => openCamera('video')}
            className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold">Record Video</span>
          </button>

          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold">Gallery</span>
          </button>
        </div>

        {/* Saved Gallery */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" /> Saved Photos & Videos ({galleryEntries.length})
            </h2>
          </div>

          {galleryEntries.length > 0 ? (
            <div className="space-y-3">
              {galleryEntries.map((entry) => (
                <MediaCard
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteMediaEntry}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-bold text-center py-6">
              No photos or videos yet. Take a photo, record a video, or browse your gallery!
            </p>
          )}
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
