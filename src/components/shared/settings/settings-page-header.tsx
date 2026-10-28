'use client';

import type { ReactNode } from 'react';
import { Flex } from '@radix-ui/themes';
import { Settings2 } from 'lucide-react';

export function SettingsPageHeader({
  title,
  description,
  navigation,
}: {
  title: string;
  description: string;
  navigation: ReactNode;
}) {
  return (
    <Flex asChild direction="column" gap="4" className="py-1">
      <header>
        <Flex align="center" justify="between" gap="3">
          {navigation}
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Preferences
          </span>
          <Flex
            align="center"
            justify="center"
            aria-hidden="true"
            className="size-10 rounded-xl bg-primary/10 text-primary"
          >
            <Settings2 className="size-5" />
          </Flex>
        </Flex>
        <Flex direction="column" gap="1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </Flex>
      </header>
    </Flex>
  );
}
