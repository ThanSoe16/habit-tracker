import { Flex } from '@radix-ui/themes';
import type { LucideIcon } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type SettingsSectionHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export function SettingsSectionHeader({
  title,
  description,
  icon: Icon,
}: SettingsSectionHeaderProps) {
  return (
    <CardHeader className="border-b">
      <Flex align="start" gap="3">
        {Icon && (
          <Flex
            align="center"
            justify="center"
            aria-hidden="true"
            className="size-9 shrink-0 rounded-xl bg-primary/10 text-primary"
          >
            <Icon className="size-4" />
          </Flex>
        )}
        <Flex direction="column" gap="1" className="min-w-0">
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </Flex>
      </Flex>
    </CardHeader>
  );
}
