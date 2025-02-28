
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/social/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocialHeader } from "@/components/social/SocialHeader";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profiles, setProfiles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      try {
        let postsQuery = supabase
          .from('posts')
          .select(`
            *,
            user:user_id (
              id,
              full_name,
              avatar_url,
            ),
            likes:post_likes (count),
            comments:post_comments (count),
            user_likes:post_likes (id, user_id)
          `)
          .order('created_at', { ascending: false });

        // If it's a stock symbol search (starts with $)
        if (query.startsWith('$')) {
          postsQuery = postsQuery.ilike('content', `%${query}%`);
        } else {
          // Regular search
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`);
          
          setProfiles(profilesData || []);
          postsQuery = postsQuery.ilike('content', `%${query}%`);
        }

        const { data: postsData } = await postsQuery;

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SocialHeader />
      <div className="max-w-2xl mx-auto pt-4 px-4">
        <h1 className="text-2xl font-bold mb-6">
          {query.startsWith('$') ? 
            `Posts mentioning ${query}` : 
            `Search results for "${query}"`
          }
        </h1>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading results...</div>
        ) : (
          <div className="space-y-6">
            {!query.startsWith('$') && profiles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b dark:border-gray-700">
                  <h2 className="text-xl font-semibold">People</h2>
                </div>
                <div className="divide-y dark:divide-gray-700">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
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
                <h2 className="text-xl font-semibold">Posts</h2>
                {posts.map((post) => (
                  <Post key={post.id} {...post} />
                ))}
              </div>
            )}

            {profiles.length === 0 && posts.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
