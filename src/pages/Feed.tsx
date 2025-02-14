
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/social/Post";
import { CreatePost } from "@/components/social/CreatePost";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { WhoToFollow } from "@/components/social/WhoToFollow";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const user = useUser();

  const fetchPosts = async () => {
    try {
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
          likes:post_likes(count),
          user_likes:post_likes(id, user_id)!inner(user_id),
          comments:post_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts = data.map(post => ({
          ...post,
          likes_count: post.likes[0]?.count || 0,
          comments_count: post.comments[0]?.count || 0,
          is_liked: post.user_likes.some((like: any) => like.user_id === user?.id)
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

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
              <CreatePost onPostCreated={fetchPosts} />
              
              {posts.map(post => (
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
              ))}
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
