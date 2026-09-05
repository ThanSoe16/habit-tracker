'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Archive, Camera, Mic, Settings, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { href: '/store/voice', label: 'Voice recordings', icon: Mic },
  { href: '/store/gallery', label: 'Gallery', icon: Camera },
  { href: '/store-generals/settings', label: 'Media settings', icon: Settings },
  { href: '/account', label: 'Account & app', icon: User },
];
export function MediaSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 font-semibold">
          <Archive className="size-5 text-primary" />
          Media library
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Media</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton variant="primary" asChild isActive={pathname === href}>
                    <Link href={href} onClick={() => setOpenMobile(false)}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
