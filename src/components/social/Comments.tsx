/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/social/Comments.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Comment as CommentComponent } from "./Comment";
import { useCommentsApi } from "@/hooks/useCommentsApi";
import { AlertCircle } from "lucide-react";

interface CommentsProps {
  postId: string;
  comments?: any[]; // Accept any comment format for flexibility
  onCommentAdded?: (isDelete?: boolean) => void; // Add optional parameter
}

// Helper for ensuring valid dates
const ensureValidDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return new Date().toISOString();
  
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const Comments = ({ postId, comments: initialComments = [], onCommentAdded }: CommentsProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);
  
  // Use GraphQL hooks
  const { useCreateComment, usePostComments } = useCommentsApi();
  const { createComment, loading: createLoading } = useCreateComment();
  
  // Fetch comments with GraphQL, using the enhanced hook
  const { 
    safeComments, 
    loading: commentsLoading, 
    error: commentsError, 
    refetch: refetchComments 
  } = usePostComments(
    postId,
    { first: 20 }
  );

  // Track initialization
  const initializedRef = useRef(false);
  
  // ONE SIMPLIFIED EFFECT - This only runs once
  useEffect(() => {
    if (!initializedRef.current) {
      // Process initial comments and set state once
      if (safeComments && safeComments.length > 0) {
        setLocalComments(safeComments);
      } else if (initialComments && initialComments.length > 0) {
        const processedComments = initialComments.map(comment => ({
          ...comment,
          createdAt: ensureValidDate(comment.createdAt || comment.created_at)
        }));
        setLocalComments(processedComments);
      }
      
      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only runs once
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || createLoading) return;
    
    setErrorMsg(null);
    const commentContent = newComment.trim();
    setNewComment(""); // Clear input immediately for better UX

    // Create an optimistic comment for better UX
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: commentContent,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLikedByMe: false,
      author: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    };

    // Immediately add to local state for instant UI feedback
    setLocalComments(prevComments => [optimisticComment, ...prevComments]);

    try {
      // Call the GraphQL mutation to create the comment
      const createdComment = await createComment({ 
        postId, 
        content: commentContent
      });
      
      if (createdComment) {
        console.log("Comment created successfully:", createdComment);
        
        // Replace optimistic comment with real one in UI
        setLocalComments(prevComments => 
          prevComments.map(comment => 
            comment.id === optimisticComment.id ? createdComment : comment
          )
        );
        
        // Always notify parent component
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setErrorMsg("Failed to post comment. Please try again.");
      
      // Remove the optimistic comment on error
      setLocalComments(prevComments => 
        prevComments.filter(comment => comment.id !== optimisticComment.id)
      );
      
      // Restore the comment text so user doesn't lose their input
      setNewComment(commentContent);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    // Remove the deleted comment from local state
    setLocalComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
    
    // Notify parent about the deletion to update counts
    if (onCommentAdded) {
      // Pass false to indicate deletion (it will decrease the count)
      onCommentAdded(true); 
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setErrorMsg(null);
    
    try {
      const result = await refetchComments();
      if (result?.data?.postComments) {
        setLocalComments(result.data.postComments);
        initializedRef.current = true; // Mark as initialized when we get data
      }
    } catch (error) {
      console.error("Error retrying comment fetch:", error);
      setErrorMsg("Still having trouble. Please try again later.");
    } finally {
      setIsRetrying(false);
    }
  };

  // A function to safely prepare comment data for the Comment component
  const prepareCommentData = (comment: any) => {
    return {
      id: comment.id,
      content: comment.content,
      // Ensure the createdAt date is a valid ISO string
      createdAt: ensureValidDate(comment.createdAt || comment.created_at),
      likesCount: comment.likesCount || 0,
      isLikedByMe: comment.isLikedByMe || false,
      postId: postId, // Add this line to include the postId
      author: {
        id: comment.author?.id || comment.user?.id || user?.id || 'unknown',
        displayName: comment.author?.displayName || comment.user?.full_name || user?.displayName || 'Unknown User',
        avatarUrl: comment.author?.avatarUrl || comment.user?.avatar_url || user?.avatarUrl
      }
    };
  };

  // Use safeComments directly in the render if available
  const displayComments = safeComments && safeComments.length > 0 && initializedRef.current
    ? safeComments
    : localComments;

  return (
    <div className="space-y-4">
      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-between items-center">
            {errorMsg && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}
            <Button 
              type="submit" 
              disabled={!newComment.trim() || createLoading}
              className="ml-auto"
            >
              {createLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      )}

      {/* Comments section with error handling */}
      <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-800">
        {commentsLoading && !displayComments.length ? (
          <div className="py-4 text-center text-gray-500">
            {isRetrying ? "Retrying..." : "Loading comments..."}
          </div>
        ) : commentsError && !displayComments.length ? (
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md mb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                <AlertCircle size={16} />
                <p className="text-sm font-medium">Error loading comments</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Unable to load comments.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="text-xs"
                >
                  {isRetrying ? "Retrying..." : "Retry"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Comment list */}
        {displayComments.length > 0 ? (
          displayComments.map((comment: any) => (
            <CommentComponent
              key={comment.id}
              comment={prepareCommentData(comment)}
              postId={postId} // Pass the postId
              onCommentDeleted={() => handleCommentDeleted(comment.id)}
            />
          ))
        ) : !commentsLoading && !commentsError ? (
          <div className="py-4 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : null}
      </div>
    </div>
  );
};