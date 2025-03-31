// src/pages/Feed.tsx
import { useAuth } from "@/contexts/AuthContext";
import { CreatePost } from "@/components/social/CreatePost";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { WhoToFollow } from "@/components/social/WhoToFollow";
import { Spinner } from "@/components/ui/loaders";
import { useNavigate } from "react-router-dom";
import { FeedSelector } from "@/components/social/FeedSelctor";
import { useEffect, useRef } from "react";

const Feed = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Register the scroll container for use with IntersectionObserver
  useEffect(() => {
    // This is a workaround to ensure IntersectionObserver works with custom scroll containers
    // We set a custom property on window that our hooks can use
    if (scrollContainerRef.current) {
      // @ts-expect-error - Adding custom property to window
      window.feedScrollContainer = scrollContainerRef.current;
    }

    return () => {
      // Clean up when component unmounts
      // @ts-expect-error - Removing custom property
      delete window.feedScrollContainer;
    };
  }, []);

  // Handle authentication-related redirects
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" label="Loading your account..." />
      </div>
    );
  }

  // Prevent rendering the feed if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
        <SocialSidebar />
      </div>
      
      <div className="fixed left-1/2 transform -translate-x-1/2" style={{
        width: '680px',
        marginLeft: '34px'
      }}>
        <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
          <SocialHeader />
          {/* Add ref to scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
            id="feed-scroll-container"
          >
            <div className="px-4 py-4 space-y-4">
              <CreatePost onPostCreated={() => {}} />
              <FeedSelector />
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed right-0 top-0 w-[320px] h-full p-4">
        <WhoToFollow />
      </div>
    </div>
  );
};

export default Feed;