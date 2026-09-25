import { GoalsShell } from '@/components/pages/goals/_components/goals-shell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GoalsShell>{children}</GoalsShell>;
}
