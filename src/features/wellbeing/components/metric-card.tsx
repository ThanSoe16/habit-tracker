import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
}

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex min-h-28 items-start justify-between gap-2 p-4">
        <div className="relative z-10 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-xl font-black tracking-tight">{value}</p>
          {detail && <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>}
        </div>
        <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <Icon />
        </span>
        <span className="absolute -bottom-8 -right-8 size-24 rounded-full bg-primary/5" aria-hidden />
      </CardContent>
    </Card>
  );
}
