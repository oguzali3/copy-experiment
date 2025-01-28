import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};