'use client';

import React from 'react';

export function SplashProgress() {
  return (
    <div className="mt-8 w-40 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary animate-[progress_2s_ease-out_forwards]" />
    </div>
  );
}
