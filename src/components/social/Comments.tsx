
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "./Comment";
import { toast } from "sonner";

interface CommentsProps {
  postId: string;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      full_name: string;
      avatar_url: string;
      username: string;
    };
  }>;
  onCommentAdded?: () => void;
}

export const Comments = ({ postId, comments, onCommentAdded }: CommentsProps) => {
  const user = useUser();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([{ 
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment("");
      onCommentAdded?.();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
          >
            Post Comment
          </Button>
        </form>
      )}
      <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-800">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            {...comment}
            onCommentDeleted={onCommentAdded}
          />
        ))}
      </div>
    </div>
  );
};
