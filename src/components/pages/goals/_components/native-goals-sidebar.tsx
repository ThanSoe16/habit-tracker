'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Clock3, Home, ListChecks, Plus, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LogoutButton } from '@/components/shared/buttons/logout-button';

const links = [
  { href: '/goals', label: 'Home', icon: Home },
  { href: '/goals/manage', label: 'Goal list', icon: ListChecks },
  { href: '/goals/create', label: 'Create goal', icon: Plus },
  { href: '/goals/history', label: 'History', icon: Clock3 },
  { href: '/goals/settings', label: 'Settings', icon: Settings },
];

export function NativeGoalsSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="px-2 py-3 text-lg font-semibold">Goal Tracker</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname.replace(/\/$/, '') === href}
                    onClick={() => {
                      router.push(href);
                      setOpenMobile(false);
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
