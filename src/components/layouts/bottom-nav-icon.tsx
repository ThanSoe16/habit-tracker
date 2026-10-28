'use client';

import Image from 'next/image';
import { useState } from 'react';

type BottomNavIconProps = {
  src: string;
  reduceMotion: boolean;
};

export function BottomNavIcon({ src, reduceMotion }: BottomNavIconProps) {
  const [hasError, setHasError] = useState(false);
  const poster = src.replace(/\.mp4$/, '-poster.png');

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
      src={src}
      poster={poster}
      width={32}
      height={32}
      autoPlay
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
