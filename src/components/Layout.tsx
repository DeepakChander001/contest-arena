import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 ml-[280px]">
        {children}
      </main>
    </div>
  );
};
