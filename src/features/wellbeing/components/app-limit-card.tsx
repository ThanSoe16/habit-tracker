import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import type { AppLimit } from '../types';
import { formatDuration } from '../utils/format-duration';
import { AppIcon } from './app-icon';

interface AppLimitCardProps {
  limit: AppLimit;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AppLimitCard({ limit, onToggle, onEdit, onDelete }: AppLimitCardProps) {
  const percentage = Math.min(100, (limit.usedTodaySeconds / limit.dailyLimitSeconds) * 100);
  const remaining = Math.max(0, limit.dailyLimitSeconds - limit.usedTodaySeconds);
  const exceeded = limit.usedTodaySeconds >= limit.dailyLimitSeconds;

  return (
    <Card className="overflow-hidden rounded-[2rem] shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-center gap-3">
        <AppIcon app={{ ...limit, category: 'Other', iconUrl: null }} />
        <div className="min-w-0 flex-1">
          <CardTitle>{limit.appName}</CardTitle>
          <p className="text-xs text-muted-foreground">{formatDuration(limit.usedTodaySeconds)} of {formatDuration(limit.dailyLimitSeconds)}</p>
        </div>
        <Switch checked={limit.enabled} onCheckedChange={onToggle} aria-label={`${limit.appName} limit`} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{exceeded ? `${formatDuration(limit.usedTodaySeconds - limit.dailyLimitSeconds)} over limit` : `${formatDuration(remaining)} remaining`}</span>
          <Badge variant={exceeded ? 'destructive' : 'secondary'}>{exceeded ? 'Limit reached' : `${formatDuration(limit.warningBeforeSeconds)} warning`}</Badge>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}><Pencil data-icon="inline-start" /> Edit</Button>
        <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 data-icon="inline-start" /> Delete</Button>
      </CardFooter>
    </Card>
  );
}
