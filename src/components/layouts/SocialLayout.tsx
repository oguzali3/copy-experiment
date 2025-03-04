// src/components/layouts/SocialLayout.tsx
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { CreatePost } from "@/components/social/CreatePost";
import { WhoToFollow } from "@/components/social/WhoToFollow";
import { useLocation } from "react-router-dom";

interface SocialLayoutProps {
  children?: ReactNode;
}

export const SocialLayout = ({ children }: SocialLayoutProps) => {
  const location = useLocation();
  // Determine if we should show the create post component
  const showCreatePost = location.pathname === '/feed' || location.pathname === '/';
  
  return (
    <div className="w-full h-screen flex">
      {/* Left column for sidebar */}
      <div className="w-[70px] h-full flex-shrink-0">
        <SocialSidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex justify-center">
        {/* Center column - main content */}
        <div className="w-[600px] border-x border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-gray-900">
          <SocialHeader />
          <div className="flex-1 overflow-y-auto">
            {showCreatePost && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <CreatePost onPostCreated={() => {}} />
              </div>
            )}
            <div className="p-4">
              {children || <Outlet />}
            </div>
          </div>
        </div>
        
        {/* Right column - suggestions and who to follow */}
        <div className="w-[320px] sticky top-0 h-screen overflow-y-auto pl-4 pr-8 py-4 hidden lg:block">
          {/* Profile card at the top */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">tester</h2>
              <button className="px-4 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                Follow
              </button>
            </div>
            <p className="text-gray-500 text-sm">@tester</p>
          </div>
          
          {/* Who to follow section */}
          <div className="mb-4">
            <WhoToFollow />
          </div>
          
          {/* Suggestions refresh button */}
          <div className="text-center">
            <button className="text-blue-500 text-sm hover:underline">
              Refresh suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLayout;