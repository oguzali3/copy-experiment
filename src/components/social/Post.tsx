import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, User } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comments } from "./Comments";
import { useNavigate } from "react-router-dom";

interface PostProps {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  image_url?: string | null;
  onPostUpdated?: () => void;
}

export const Post = ({
  id,
  content,
  created_at,
  user,
  likes_count,
  comments_count,
  is_liked: initialIsLiked,
  image_url,
  onPostUpdated
}: PostProps) => {
  const currentUser = useUser();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleLike = async () => {
    if (!currentUser || isLiking) return;

    setIsLiking(true);
    try {
      if (!isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: id, user_id: currentUser.id }]);

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
      onPostUpdated?.();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const transformedComments = (commentsData || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          id: comment.user_id,  // Added this field
          full_name: comment.profiles?.full_name || 'Unknown User',
          avatar_url: comment.profiles?.avatar_url || '',
          username: comment.profiles?.username || 'unknown'
        }
      }));

      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleUserClick = () => {
    if (user.id === currentUser?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile?id=${user.id}`);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button 
              className="hover:underline font-semibold"
              onClick={handleUserClick}
            >
              {user.full_name}
            </button>
            <button 
              className="text-gray-500 hover:underline"
              onClick={handleUserClick}
            >
              @{user.username}
            </button>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-2 text-gray-900">{content}</p>
          
          {image_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={image_url}
                alt="Post image"
                className="max-h-[400px] w-full object-cover"
              />
            </div>
          )}

          <div className="flex gap-6 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLike}
              disabled={!currentUser || isLiking}
            >
              <Heart 
                className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
              <span>{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={toggleComments}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments_count}</span>
            </Button>
          </div>

          {showComments && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              {isLoadingComments ? (
                <div className="text-center py-4">Loading comments...</div>
              ) : (
                <Comments
                  postId={id}
                  comments={comments}
                  onCommentAdded={() => {
                    fetchComments();
                    onPostUpdated?.();
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
