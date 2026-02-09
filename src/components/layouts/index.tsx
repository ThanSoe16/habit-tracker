import { BottomNav } from "./bottom_nav";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-background">{children}</div>
      <BottomNav />
    </div>
  );
};

export default PageLayout;
