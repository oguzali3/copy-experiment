
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
