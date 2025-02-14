
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Trash2, Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { CommentReply } from "./CommentReply";

interface CommentProps {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  onCommentDeleted?: () => void;
}

export const Comment = ({
  id,
  content,
  created_at,
  user,
  onCommentDeleted
}: CommentProps) => {
  const currentUser = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(0);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchLikeStatus = async () => {
    if (!currentUser) return;

    const { data: likes, error: likesError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', id)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (!likesError) {
      setIsLiked(!!likes);
    }

    const { count, error: countError } = await supabase
      .from('comment_likes')
      .select('id', { count: 'exact', head: true })
      .eq('comment_id', id);

    if (!countError && count !== null) {
      setLikesCount(count);
    }
  };

  const fetchRepliesCount = async () => {
    const { count, error } = await supabase
      .from('comment_replies')
      .select('id', { count: 'exact', head: true })
      .eq('comment_id', id);

    if (!error && count !== null) {
      setRepliesCount(count);
    }
  };

  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from('comment_replies')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:user_id (
          id,
          full_name,
          avatar_url,
          username
        )
      `)
      .eq('comment_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return;
    }

    const transformedReplies = data.map(reply => ({
      id: reply.id,
      content: reply.content,
      created_at: reply.created_at,
      user: reply.user
    }));

    setReplies(transformedReplies);
  };

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      if (!isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .insert([{ comment_id: id, user_id: currentUser.id }]);

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like");
    }
  };

  const handleReply = async () => {
    if (!currentUser || !replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const { error } = await supabase
        .from('comment_replies')
        .insert([{
          comment_id: id,
          user_id: currentUser.id,
          content: replyContent.trim()
        }]);

      if (error) throw error;

      setReplyContent("");
      setIsReplying(false);
      fetchReplies();
      fetchRepliesCount();
      toast.success("Reply added successfully");
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error("Failed to add reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || isDeleting) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onCommentDeleted?.();
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchLikeStatus();
    fetchRepliesCount();
  }, []);

  return (
    <div className="py-3">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{user.full_name}</span>
            <span className="text-gray-500 text-sm">@{user.username}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{content}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-6 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 text-gray-500"
              onClick={() => {
                setIsReplying(!isReplying);
                if (!showReplies) {
                  setShowReplies(true);
                  fetchReplies();
                }
              }}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {repliesCount > 0 && <span className="text-sm">{repliesCount}</span>}
            </Button>
            {currentUser?.id === user.id && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 text-red-600 hover:text-red-700"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmittingReply}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {showReplies && replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {replies.map((reply) => (
                <CommentReply
                  key={reply.id}
                  {...reply}
                  onReplyDeleted={() => {
                    fetchReplies();
                    fetchRepliesCount();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
