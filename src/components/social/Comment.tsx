
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentProps {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;  // Added this field
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

  return (
    <div className="flex gap-3 py-3">
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
        {currentUser?.id === user.id && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-8 text-red-600 hover:text-red-700"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
