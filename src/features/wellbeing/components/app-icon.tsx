import {
  AppWindow,
  BriefcaseBusiness,
  Gamepad2,
  Globe2,
  GraduationCap,
  HeartPulse,
  Instagram,
  Languages,
  MessageCircle,
  MessagesSquare,
  Music2,
  Play,
  ShoppingBag,
  WalletCards,
  Youtube,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils/cn';
import type { AppUsage } from '../types';

function AppGlyph({ app }: { app: Pick<AppUsage, 'appIdentifier' | 'appName' | 'category'> }) {
  const identity = `${app.appIdentifier} ${app.appName}`.toLowerCase();
  if (identity.includes('instagram')) return <Instagram />;
  if (identity.includes('youtube')) return <Youtube />;
  if (identity.includes('tiktok')) return <Music2 />;
  if (identity.includes('chrome') || identity.includes('browser')) return <Globe2 />;
  if (identity.includes('message')) return <MessageCircle />;
  if (identity.includes('duolingo') || identity.includes('language')) return <Languages />;
  if (identity.includes('shop')) return <ShoppingBag />;
  if (identity.includes('health') || identity.includes('fitness')) return <HeartPulse />;
  if (identity.includes('bank') || identity.includes('finance')) return <WalletCards />;
  if (app.category === 'Social') return <MessagesSquare />;
  if (app.category === 'Entertainment') return <Play />;
  if (app.category === 'Productivity') return <BriefcaseBusiness />;
  if (app.category === 'Games') return <Gamepad2 />;
  if (app.category === 'Education') return <GraduationCap />;
  return <AppWindow />;
}

export function AppIcon({ app, className }: { app: Pick<AppUsage, 'appIdentifier' | 'appName' | 'category' | 'iconUrl'>; className?: string }) {
  return (
    <Avatar className={cn('size-12 rounded-2xl border border-border bg-card shadow-sm', className)}>
      {app.iconUrl && <AvatarImage src={app.iconUrl} alt={`${app.appName} icon`} className="object-cover" />}
      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
        <AppGlyph app={app} />
      </AvatarFallback>
    </Avatar>
  );
}
