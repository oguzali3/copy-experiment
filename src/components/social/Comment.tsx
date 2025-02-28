// src/components/social/Comment.tsx
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Trash2, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useCommentsApi } from "@/hooks/useCommentsApi";

// Allow both GraphQL Comment type and legacy format
interface CommentProps {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    isLikedByMe: boolean;
    postId?: string; // Add this line
    author: {
      id: string;
      displayName: string;
      avatarUrl?: string;
    }
  };
  postId?: string; // Add this too to get it from parent
  onCommentDeleted?: () => void;
}

// Helper for safe date formatting
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // If invalid date, use current time
      return formatDistanceToNow(new Date(), { addSuffix: true });
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    console.warn('Invalid date format:', dateStr, e);
    return 'recently';
  }
};

export const Comment = ({ comment, onCommentDeleted }: CommentProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(comment.isLikedByMe);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use GraphQL hooks
  const { useUpdateComment, useDeleteComment, useLikeComment } = useCommentsApi();
  const { updateComment, loading: updateLoading } = useUpdateComment();
  const { deleteComment, loading: deleteLoading } = useDeleteComment();
  const { toggleLike } = useLikeComment();

  const handleLike = async () => {
    if (!user) return;

    try {
      const result = await toggleLike(comment.id, isLiked);
      
      if (result) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleEdit = async () => {
    if (!user || !editContent.trim() || updateLoading) return;
  
    // Save the original content in case the update fails
    const originalContent = comment.content;
    
    // Immediately update the UI for better UX
    const newContent = editContent.trim();
    setIsEditing(false);
    
    try {
      await updateComment(comment.id, { content: newContent });
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
      
      // Revert to editing state with original content on error
      setIsEditing(true);
      setEditContent(originalContent);
    }
  };
  const handleDelete = async () => {
    if (!user || isDeleting || deleteLoading) return;
    setIsDeleting(true);
  
    try {
      // Just use the comment.id - we don't need to pass context, the cache update will handle it
      const success = await deleteComment(comment.id);
      
      if (success) {
        // Call the onCommentDeleted callback to update parent component
        onCommentDeleted?.();
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      setIsDeleting(false);
    }
  };

  // If comment is being deleted, show a deleting state
  if (isDeleting) {
    return (
      <div className="py-3 opacity-50">
        <div className="text-center text-sm text-gray-500">
          Deleting comment...
        </div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatarUrl || undefined} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{comment.author.displayName}</span>
            <span className="text-gray-500 text-sm">@{comment.author.displayName}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-words">{comment.content}</p>
          )}
          
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
            
            {user?.id === comment.author.id && !isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 text-gray-500"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 text-red-600 hover:text-red-700"
                  onClick={handleDelete}
                  disabled={deleteLoading || isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};