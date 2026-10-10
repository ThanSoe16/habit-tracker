import type { Metadata, Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import { NativeGoalsProvider } from '@/components/providers/native-goals-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import '../../src/styles/globals.css';

export const metadata: Metadata = { title: 'Goal Tracker', icons: { icon: '/favicon.ico' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <body
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <NuqsAdapter>
          <NativeGoalsProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </NativeGoalsProvider>
        </NuqsAdapter>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
