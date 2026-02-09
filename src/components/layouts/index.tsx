import { BottomNav } from "./bottom_nav";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">{children}</div>
      <BottomNav />
    </div>
  );
};

export default PageLayout;
