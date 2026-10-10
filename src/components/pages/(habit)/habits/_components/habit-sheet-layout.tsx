'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/utils/cn';

export function HabitSheetBody({ children }: { children: ReactNode }) {
  return (
    <Flex
      direction="column"
      gap="6"
      className="mx-auto flex min-h-0 w-full max-w-sm flex-col gap-6 overflow-y-auto px-2 pb-10 pt-2"
    >
      {children}
    </Flex>
  );
}

export function HabitSheetHeader({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <DrawerHeader className="gap-2 p-0 text-center md:gap-2 md:text-center">
      <DrawerTitle className="text-2xl font-black tracking-tight">{title}</DrawerTitle>
      <DrawerDescription className="text-xs font-semibold">{description}</DrawerDescription>
    </DrawerHeader>
  );
}

export function HabitSheetButton({
  className,
  variant = 'default',
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      variant={variant}
      className={cn(
        'h-14 gap-2 rounded-3xl px-6 text-base font-black transition-transform active:scale-98',
        variant === 'default' && 'shadow-xl shadow-primary/25 hover:bg-primary/90',
        className,
      )}
    />
  );
}
