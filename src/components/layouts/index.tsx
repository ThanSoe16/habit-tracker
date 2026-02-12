import { BottomNav } from "./bottom_nav";
import { ReminderProvider } from "@/components/providers/ReminderProvider";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ReminderProvider>
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </ReminderProvider>
      <BottomNav />
    </div>
  );
};

export default PageLayout;
