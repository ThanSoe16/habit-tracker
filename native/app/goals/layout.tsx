import { NativeAuthGuard } from '@/components/providers/native-auth-guard';
import { GoalsShell } from '@/components/pages/goals/_components/goals-shell';
import { NativeGoalsSidebar } from '@/components/pages/goals/_components/native-goals-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <NativeAuthGuard>
      <GoalsShell sidebar={<NativeGoalsSidebar />}>{children}</GoalsShell>
    </NativeAuthGuard>
  );
}
