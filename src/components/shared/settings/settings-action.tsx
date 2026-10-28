'use client';

import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';

type SettingsActionProps = {
  label: string;
  description?: string;
  icon?: LucideIcon;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function SettingsAction({
  label,
  description,
  icon: Icon,
  href,
  onClick,
}: SettingsActionProps) {
  const content = (
    <>
      {Icon && <Icon data-icon="inline-start" />}
      <Flex asChild direction="column" gap="1" className="min-w-0 flex-1 text-left">
        <span>
          <span>{label}</span>
          {description && (
            <span className="text-xs font-normal text-muted-foreground">{description}</span>
          )}
        </span>
      </Flex>
      <ChevronRight data-icon="inline-end" />
    </>
  );
  return (
    <Button
      type="button"
      variant="outline"
      className="h-auto min-h-11 w-full justify-between gap-3 whitespace-normal py-3"
      asChild={href !== undefined}
      onClick={onClick}
    >
      {href !== undefined ? <Link href={href}>{content}</Link> : content}
    </Button>
  );
}
