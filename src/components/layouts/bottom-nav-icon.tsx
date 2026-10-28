'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type BottomNavIconProps = {
  src: string;
  isActive: boolean;
  reduceMotion: boolean;
};

export function BottomNavIcon({ src, isActive, reduceMotion }: BottomNavIconProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const poster = src.replace(/\.mp4$/, '-poster.png');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !reduceMotion && !hasError) {
      void video.play().catch(() => {
        // Keep the still frame if playback is blocked or interrupted by navigation.
      });
    } else {
      video.pause();
    }

    return () => video.pause();
  }, [src, isActive, reduceMotion, hasError]);

  if (reduceMotion || hasError) {
    return (
      <Image
        src={poster}
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        className="pointer-events-none size-8 rounded-full object-contain"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      width={32}
      height={32}
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onError={() => setHasError(true)}
      className="pointer-events-none size-8 rounded-full object-contain"
    />
  );
}
