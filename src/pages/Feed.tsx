
import { useState, useEffect } from "react";
import { CreatePost } from "@/components/social/CreatePost";
import { Post } from "@/components/social/Post";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

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

interface PostData {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  likes_count: { count: number }[];
  comments_count: { count: number }[];
  is_liked: { user_id: string }[];
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
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            username
          ),
          likes_count:post_likes(count),
          comments_count:post_comments(count),
          is_liked:post_likes!inner(user_id)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts((postsData || []).map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user: {
          full_name: post.profiles?.full_name || 'Unknown User',
          avatar_url: post.profiles?.avatar_url || '',
          username: post.profiles?.username || 'unknown'
        },
        likes_count: post.likes_count[0]?.count || 0,
        comments_count: post.comments_count[0]?.count || 0,
        is_liked: post.is_liked?.length > 0 || false
      })));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
  );
};

export default Feed;
