
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/social/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SocialHeader } from "@/components/social/SocialHeader";

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [profiles, setProfiles] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      try {
        // Search profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
          .limit(3);

        // Search posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            user:user_id (
              id,
              full_name,
              avatar_url,
              username
            ),
            likes:post_likes (count),
            comments:post_comments (count),
            user_likes:post_likes (id, user_id)
          `)
          .textSearch('content', query)
          .order('created_at', { ascending: false });

        setProfiles(profilesData || []);
        setPosts(postsData ? postsData.map(post => ({
          ...post,
          likes_count: post.likes[0]?.count || 0,
          comments_count: post.comments[0]?.count || 0,
          is_liked: false
        })) : []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  if (!query) {
    return <div className="p-8 text-center text-gray-500">Enter a search term to see results</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialHeader />
      <div className="max-w-2xl mx-auto pt-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading results...</div>
        ) : (
          <div className="space-y-6">
            {profiles.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">People</h2>
                </div>
                <div className="divide-y">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 text-left"
                      onClick={() => handleProfileClick(profile.id)}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{profile.full_name}</div>
                        <div className="text-sm text-gray-500">@{profile.username}</div>
                        {profile.bio && (
                          <div className="text-sm text-gray-600 mt-1">{profile.bio}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold px-4">Posts</h2>
                {posts.map((post) => (
                  <Post key={post.id} {...post} />
                ))}
              </div>
            )}

            {profiles.length === 0 && posts.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
