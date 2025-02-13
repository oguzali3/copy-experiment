
import { useState, useEffect } from "react";
import { CreatePost } from "@/components/social/CreatePost";
import { Post } from "@/components/social/Post";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";

interface PostType {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

const Feed = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            avatar_url,
            username
          ),
          post_likes (
            user_id
          ),
          post_comments (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const transformedPosts: PostType[] = (postsData || []).map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user: {
          full_name: post.profiles?.full_name || 'Unknown User',
          avatar_url: post.profiles?.avatar_url || '',
          username: post.profiles?.username || 'unknown'
        },
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        is_liked: post.post_likes?.some(like => like.user_id === user?.id) || false
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SocialHeader />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto flex">
          <SocialSidebar />
          <main className="flex-1 min-w-0 border-x border-gray-200">
            <div className="max-w-2xl">
              <CreatePost onPostCreated={fetchPosts} />
              <div className="space-y-4">
                {posts.map((post) => (
                  <Post 
                    key={post.id} 
                    {...post} 
                    onPostUpdated={fetchPosts}
                  />
                ))}
              </div>
            </div>
          </main>
          <div className="w-80 flex-shrink-0">
            {/* Right sidebar placeholder for future use */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
