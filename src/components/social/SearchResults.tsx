import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Post } from "./Post";

interface SearchResultsProps {
  query: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[];
  onClose: () => void;
}

export const SearchResults = ({ query, profiles, posts, onClose }: SearchResultsProps) => {
  const navigate = useNavigate();

  if (!query) return null;

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
    onClose();
  };
  
  const handlePostClick = (postId: string) => {
    console.log('Navigating to post with ID:', postId);
    navigate(`/post/${postId}`);
    
    // Check if URL change worked
    setTimeout(() => {
      console.log('Current URL after navigation:', window.location.href);
    }, 100);
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-2 max-h-[80vh] overflow-y-auto z-50">
      {profiles.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg mb-3">People</h3>
          <div className="space-y-4">
            {profiles.slice(0, 3).map((profile) => (
              <button
                key={profile.id}
                className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-md text-left"
                onClick={() => handleProfileClick(profile.id)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{profile.full_name}</div>
                  <div className="text-sm text-gray-500">@{profile.displayName}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-3">Posts</h3>
          <div className="space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors" 
                onClick={() => handlePostClick(post.id)}
              >
                <Post {...post} />
              </div>
            ))}
          </div>
        </div>
      )}

      {profiles.length === 0 && posts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};