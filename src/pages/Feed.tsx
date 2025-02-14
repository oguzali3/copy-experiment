
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/social/Post";
import { CreatePost } from "@/components/social/CreatePost";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { WhoToFollow } from "@/components/social/WhoToFollow";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PostData {
  id: string;
  content: string;
  created_at: string;
  image_url: string | null;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  likes: { count: number }[];
  comments: { count: number }[];
  user_likes: { id: string; user_id: string }[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string;
  username: string;
  bio?: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const user = useUser();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSearchResults = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    try {
      // First fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Then fetch posts
      const { data: postsData, error: postsError } = await supabase
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
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (postsData) {
        const formattedPosts: PostData[] = postsData.map(post => ({
          ...post,
          likes_count: post.likes[0]?.count || 0,
          comments_count: post.comments[0]?.count || 0,
          is_liked: post.user_likes.some(like => like.user_id === user?.id)
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      toast.error("Failed to load search results");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: PostData[] = data.map(post => ({
          ...post,
          likes_count: post.likes[0]?.count || 0,
          comments_count: post.comments[0]?.count || 0,
          is_liked: post.user_likes.some(like => like.user_id === user?.id)
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (searchQuery) {
        fetchSearchResults();
      } else {
        setProfiles([]);
        fetchFeed();
      }
    }
  }, [user, searchQuery]);

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  if (!user) {
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
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              {!searchQuery && <CreatePost onPostCreated={fetchFeed} />}
              
              {searchQuery && (
                <h2 className="text-xl font-semibold px-4 py-2">
                  {searchQuery.startsWith('$') 
                    ? `Posts mentioning ${searchQuery}`
                    : `Search results for "${searchQuery}"`}
                </h2>
              )}

              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-6">
                  {/* Show profiles section if there are matching profiles */}
                  {searchQuery && profiles.length > 0 && (
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

                  {/* Show posts section */}
                  {searchQuery && posts.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Posts</h2>
                      {posts.map(post => (
                        <Post
                          key={post.id}
                          id={post.id}
                          content={post.content}
                          created_at={post.created_at}
                          user={post.user}
                          likes_count={post.likes_count}
                          comments_count={post.comments_count}
                          is_liked={post.is_liked}
                          image_url={post.image_url}
                          onPostUpdated={searchQuery ? fetchSearchResults : fetchFeed}
                        />
                      ))}
                    </div>
                  )}

                  {/* Show regular feed if no search query */}
                  {!searchQuery && posts.map(post => (
                    <Post
                      key={post.id}
                      id={post.id}
                      content={post.content}
                      created_at={post.created_at}
                      user={post.user}
                      likes_count={post.likes_count}
                      comments_count={post.comments_count}
                      is_liked={post.is_liked}
                      image_url={post.image_url}
                      onPostUpdated={fetchFeed}
                    />
                  ))}

                  {/* No results message */}
                  {searchQuery && profiles.length === 0 && posts.length === 0 && (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
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
