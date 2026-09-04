'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DIGITAL_WELLBEING_ROUTES } from '../constants/routes';

export function WellbeingPageHeader() {
  const pathname = usePathname();
  const route =
    DIGITAL_WELLBEING_ROUTES.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    ) ?? DIGITAL_WELLBEING_ROUTES[0];
  const Icon = route.icon;

  return (
    <header className="flex items-center justify-between gap-3 py-1">
      <SidebarTrigger className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs hover:bg-muted" />
      <div className="flex flex-1 items-center justify-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"><Icon /></span>
        <div><h1 className="text-lg font-black tracking-tight">{route.title}</h1><p className="text-[10px] text-muted-foreground">Digital Wellbeing</p></div>
      </div>
      <div className="size-10" />
    </header>
  );
}
