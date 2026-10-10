import type { WorkoutLog } from '@/features/gym/store/model';

export function WorkoutSessionTimes({ log }: { log: WorkoutLog }) {
  if (!log.startedAt && !log.completedAt) return null;
  const renderTime = (value: string | undefined, fallback: string) =>
    value ? (
      <time dateTime={value}>
        {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </time>
    ) : (
      fallback
    );

  return (
    <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-4 text-sm">
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">Start time</dt>
        <dd className="font-semibold text-foreground">
          {renderTime(log.startedAt, 'Not recorded')}
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">End time</dt>
        <dd className="font-semibold text-foreground">
          {renderTime(log.completedAt, log.completed ? 'Not recorded' : 'In progress')}
        </dd>
      </div>
    </dl>
  );
}
