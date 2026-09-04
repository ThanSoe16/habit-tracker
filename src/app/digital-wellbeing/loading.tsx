import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return <div className="flex flex-col gap-4"><Skeleton className="h-80 rounded-[2rem]" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div><Skeleton className="h-56 rounded-[2rem]" /></div>;
}
