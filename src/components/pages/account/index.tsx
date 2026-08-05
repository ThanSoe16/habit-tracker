'use client';

import React from 'react';
import { ChevronLeft, Settings as SettingsIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { ProfileCard } from './_components/profile-card';
import { QuickStats } from './_components/quick-stats';
import { SettingsList } from './_components/settings-list';

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 space-y-5">
        {/* Header */}
        <Flex justify="between" align="center" py="1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full shadow-xs text-foreground"
            title="Go Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <h1 className="text-lg font-black tracking-tight text-foreground">
            Account & Settings
          </h1>

          <Flex align="center" justify="center" className="w-10 h-10 rounded-full bg-primary/10 text-primary">
            <SettingsIcon className="w-5 h-5" />
          </Flex>
        </Flex>

        <ProfileCard />
        <QuickStats />
        <SettingsList />
      </div>
    </div>
  );
}

