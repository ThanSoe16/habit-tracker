import { Bell, MousePointerClick } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppIcon } from './app-icon';
import type { AppUsage } from '../types';
import { formatDuration } from '../utils/format-duration';

interface AppUsageListProps {
  apps: AppUsage[];
  limit?: number;
}

export function AppUsageList({ apps, limit }: AppUsageListProps) {
  const visibleApps = typeof limit === 'number' ? apps.slice(0, limit) : apps;
  if (!visibleApps.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No app usage recorded for this period.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {visibleApps.map((app) => (
        <div key={app.id} className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3 shadow-xs transition-colors hover:bg-muted/70">
          <AppIcon app={app} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">{app.appName}</p>
                <Badge variant="outline" className="mt-1">{app.category}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm font-black tabular-nums">{formatDuration(app.durationSeconds)}</p>
                <p className="text-[10px] font-semibold text-muted-foreground">{app.percentage}% of usage</p>
              </div>
            </div>
            <Progress value={app.percentage} className="mt-2 h-1.5" />
            <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1"><MousePointerClick /> {app.openCount} opens</span>
              <span className="flex items-center gap-1"><Bell /> {app.notifications} alerts</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
