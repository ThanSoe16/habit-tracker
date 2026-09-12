'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { authService } from '@/lib/supabase/auth';
import { EmailAuthForm } from './_components/email-auth-form';

export default function LoginPage() {
  const router = useRouter();

  const getPostLoginPath = () => {
    const requestedPath = new URLSearchParams(window.location.search).get('next');

    if (
      requestedPath &&
      requestedPath.startsWith('/') &&
      !requestedPath.startsWith('//') &&
      requestedPath !== '/login' &&
      requestedPath !== '/auth/login'
    ) {
      return requestedPath;
    }

    return '/habits/today';
  };

  useEffect(() => {
    let isMounted = true;

    void authService.getSession().then((session) => {
      if (isMounted && session) {
        router.replace(getPostLoginPath());
      }
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-zinc-800 space-y-6 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-purple-500/25">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Your personal tracker
          </h1>
          <p className="text-xs font-bold text-gray-400 max-w-xs mx-auto">
            Enter your credentials to access your synced habits & budget tracker
          </p>
        </div>

        <EmailAuthForm onSignedIn={() => router.replace(getPostLoginPath())} />
      </div>
    </div>
  );
}
