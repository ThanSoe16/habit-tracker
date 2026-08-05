'use client';

import React from 'react';
import { X, SwitchCamera, Aperture, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flex } from '@radix-ui/themes';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraMode: 'photo' | 'video';
  facingMode: 'user' | 'environment';
  isVideoRecording: boolean;
  videoRecordingTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onSwitchCamera: () => void;
  onTakePhoto: () => void;
  onStartVideoRecording: () => void;
  onStopVideoRecording: () => void;
}

export function CameraModal({
  isOpen,
  onClose,
  cameraMode,
  isVideoRecording,
  videoRecordingTime,
  videoRef,
  canvasRef,
  onSwitchCamera,
  onTakePhoto,
  onStartVideoRecording,
  onStopVideoRecording,
}: CameraModalProps) {
  if (!isOpen) return null;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4">
      <Flex justify="between" align="center" className="z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white rounded-full bg-white/20">
          <X className="w-6 h-6" />
        </Button>

        {cameraMode === 'video' && isVideoRecording && (
          <Flex align="center" gap="2" className="bg-destructive/80 text-white px-3 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {formatTime(videoRecordingTime)}
          </Flex>
        )}

        <Button variant="ghost" size="icon" onClick={onSwitchCamera} className="text-white rounded-full bg-white/20">
          <SwitchCamera className="w-5 h-5" />
        </Button>
      </Flex>

      <div className="relative flex-1 my-4 overflow-hidden rounded-3xl bg-zinc-950 flex items-center justify-center">
        <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <Flex justify="center" align="center" className="z-10 py-2">
        {cameraMode === 'photo' ? (
          <Button
            size="icon"
            onClick={onTakePhoto}
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-white/90 shadow-lg border-4 border-white/50"
          >
            <Aperture className="w-8 h-8" />
          </Button>
        ) : isVideoRecording ? (
          <Button
            size="icon"
            onClick={onStopVideoRecording}
            className="w-16 h-16 rounded-full bg-destructive text-white shadow-lg border-4 border-destructive/50"
          >
            <span className="w-6 h-6 rounded-xs bg-white" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={onStartVideoRecording}
            className="w-16 h-16 rounded-full bg-destructive text-white shadow-lg border-4 border-white/50"
          >
            <Video className="w-8 h-8" />
          </Button>
        )}
      </Flex>
    </div>
  );
}
