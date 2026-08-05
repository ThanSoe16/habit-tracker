import { BottomNav } from './bottom-nav';
import { ReminderProvider } from '@/components/providers/reminder-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <ReminderProvider>
          <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
        </ReminderProvider>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
};

export default PageLayout;
