import type { ReactNode } from 'react';
import { Flex } from '@radix-ui/themes';

export function SettingsContent({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" gap="5" className="mx-auto w-full max-w-2xl pb-8">
      {children}
    </Flex>
  );
}
