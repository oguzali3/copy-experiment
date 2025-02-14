
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/social/Post";
import { CreatePost } from "@/components/social/CreatePost";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { WhoToFollow } from "@/components/social/WhoToFollow";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

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

const Feed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const user = useUser();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      let query = supabase
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

      // If there's a search query, filter posts
      if (searchQuery) {
        query = query.ilike('content', `%${searchQuery}%`);
      }

      const { data, error } = await query;

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
      fetchPosts();
    }
  }, [user, searchQuery]);

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
              {!searchQuery && <CreatePost onPostCreated={fetchPosts} />}
              
              {searchQuery && (
                <h2 className="text-xl font-semibold px-4 py-2">
                  {searchQuery.startsWith('$') 
                    ? `Posts mentioning ${searchQuery}`
                    : `Search results for "${searchQuery}"`}
                </h2>
              )}

              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading posts...</div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <Post
                    key={post.id}
                    id={post.id}
                    content={post.content}
                    created_at={post.created_at}
                    user={{
                      id: post.user.id,
                      full_name: post.user.full_name,
                      avatar_url: post.user.avatar_url,
                      username: post.user.username
                    }}
                    likes_count={post.likes_count}
                    comments_count={post.comments_count}
                    is_liked={post.is_liked}
                    image_url={post.image_url}
                    onPostUpdated={fetchPosts}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                  {searchQuery 
                    ? `No posts found for "${searchQuery}"`
                    : "No posts yet"}
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
