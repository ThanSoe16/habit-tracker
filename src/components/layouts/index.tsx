import { BottomNav } from './bottom-nav';
import { ReminderProvider } from '@/components/providers/reminder-provider';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ReminderProvider>
        <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      </ReminderProvider>
      <BottomNav />
    </div>
  );
};

export default PageLayout;
