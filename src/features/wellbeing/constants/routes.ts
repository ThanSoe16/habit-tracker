import {
  AppWindow,
  BarChart3,
  Brain,
  Gauge,
  Lightbulb,
  MoonStar,
  Settings2,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export interface DigitalWellbeingRoute {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const DIGITAL_WELLBEING_ROUTES: DigitalWellbeingRoute[] = [
  { title: 'Overview', href: '/digital-wellbeing', icon: Gauge, exact: true },
  { title: 'App Usage', href: '/digital-wellbeing/app-usage', icon: BarChart3 },
  { title: 'App Limits', href: '/digital-wellbeing/app-limits', icon: AppWindow },
  { title: 'Focus Mode', href: '/digital-wellbeing/focus', icon: Brain },
  { title: 'Bedtime', href: '/digital-wellbeing/bedtime', icon: MoonStar },
  { title: 'Challenges', href: '/digital-wellbeing/challenges', icon: Trophy },
  { title: 'Insights', href: '/digital-wellbeing/insights', icon: Lightbulb },
  { title: 'Settings', href: '/digital-wellbeing/settings', icon: Settings2 },
];

export const DIGITAL_WELLBEING_ICON = ShieldCheck;
